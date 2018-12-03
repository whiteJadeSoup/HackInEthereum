package main

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/anaskhan96/soup"

	"github.com/tebeka/selenium"
	"github.com/tebeka/selenium/chrome"
)

const (
	seleniumPath    = "/home/constantine/vendor/selenium.jar"
	geckoDriverPath = "/home/constantine/vendor/chromedriver"
	port            = 8080
	DataFile        = "/home/constantine/vendor/data"
	BufferLen       = 30
)

func main() {

	opts := []selenium.ServiceOption{}
	caps := selenium.Capabilities{
		"browserName": "chrome",
	}

	// 禁止加载图片，加快渲染速度
	imagCaps := map[string]interface{}{
		"profile.managed_default_content_settings.images": 2,
	}

	chromeCaps := chrome.Capabilities{
		Prefs: imagCaps,
		Path:  "",
		Args: []string{
			"--no-sandbox",
			"--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0.2 Safari/604.4.7", // 模拟user-agent，防反爬
		},
	}
	caps.AddChrome(chromeCaps)

	// 启动chromedriver，端口号可自定义
	service, err := selenium.NewChromeDriverService(geckoDriverPath, 9515, opts...)
	if err != nil {
		log.Printf("Error starting the ChromeDriver server: %v", err)
	}

	// 调起chrome浏览器
	wd, err := selenium.NewRemote(caps, fmt.Sprintf("http://localhost:%d/wd/hub", 9515))
	if err != nil {
		panic(err)
	}

	url := "https://www.ethernodes.org/network/1/nodes"
	if err := wd.Get(url); err != nil {
		panic(err)
	}
	time.Sleep(5 * time.Second)

	btns, _ := wd.FindElements(selenium.ByClassName, "paginate_button")
	largestBtn := btns[len(btns)-2]
	txt, err := largestBtn.Text()

	fmt.Printf("-> largest btn text: %s\n", txt)
	btn, err := largestBtn.FindElement(selenium.ByTagName, "a")
	btn.Click()
	fmt.Printf("-> Ok. WEve clicked it !\n")
	time.Sleep(10 * time.Second)

	fmt.Printf("->> OK. Weve reached the largest page\n")

	for {
		next_btn, err := wd.FindElement(selenium.ByID, "table_next")

		if err != nil {
			fmt.Printf("<- We cant find next btn\n")
			break
		}

		classProperty, err := next_btn.GetAttribute("class")

		if succ := strings.Contains(classProperty, "disabled"); succ {
			fmt.Printf("<- NextBtn is disabled! We can exit now\n")
			break
		}

		realBtn, err := next_btn.FindElement(selenium.ByTagName, "a")

		if err != nil {
			fmt.Printf("<- unknown error with real btn!\n")
			break
		}
		realBtn.Click()

		time.Sleep(3 * time.Second)
	}

	service.Stop()
	wd.Quit()

	fmt.Printf("we've done!\n")
}

func test() {

	opts := []selenium.ServiceOption{}
	caps := selenium.Capabilities{
		"browserName": "chrome",
	}

	// 禁止加载图片，加快渲染速度
	imagCaps := map[string]interface{}{
		"profile.managed_default_content_settings.images": 2,
	}

	chromeCaps := chrome.Capabilities{
		Prefs: imagCaps,
		Path:  "",
		Args: []string{
			"--no-sandbox",
			"--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0.2 Safari/604.4.7", // 模拟user-agent，防反爬
		},
	}
	caps.AddChrome(chromeCaps)

	// 启动chromedriver，端口号可自定义
	service, err := selenium.NewChromeDriverService(geckoDriverPath, 9515, opts...)
	if err != nil {
		log.Printf("Error starting the ChromeDriver server: %v", err)
	}

	// 调起chrome浏览器
	wd, err := selenium.NewRemote(caps, fmt.Sprintf("http://localhost:%d/wd/hub", 9515))
	if err != nil {
		panic(err)
	}

	url := "https://www.ethernodes.org/network/1/nodes"
	if err := wd.Get(url); err != nil {
		panic(err)
	}
	time.Sleep(5 * time.Second)

	var results chan []string = make(chan []string, BufferLen)
	var abort chan struct{}

	go WriteToCSV(results, abort)

	var n sync.WaitGroup
	source, err := wd.PageSource()

	go func(htmlBody string) {
		n.Add(1)

		defer n.Done()
		CrawlData(htmlBody, results)
	}(source)

	for {
		next_btn, err := wd.FindElement(selenium.ByID, "table_next")

		if err != nil {
			fmt.Printf("<- We cant find next btn\n")
			break
		}

		classProperty, err := next_btn.GetAttribute("class")
		if succ := strings.Contains(classProperty, "disabled"); succ {
			fmt.Printf("<- NextBtn is disabled! We can exit now\n")
			break
		}

		realBtn, err := next_btn.FindElement(selenium.ByTagName, "a")

		if err != nil {
			fmt.Printf("<- unknown error with real btn!\n")
			break
		}
		realBtn.Click()

		time.Sleep(3 * time.Second)
		// now, weve reached next page!
		source, err := wd.PageSource()
		go func(htmlBody string) {
			n.Add(1)
			defer n.Done()

			CrawlData(htmlBody, results)
		}(source)
	}

	n.Wait()
	service.Stop()
	wd.Quit()
	if abort != nil {
		close(abort)
	}
	fmt.Printf("we've done!\n")
}

func WriteToCSV(ch chan []string, stop <-chan struct{}) {

	for {
		select {
		case <-stop:
			return

		case data := <-ch:
			fmt.Printf("-> !!!!Weve found ips: %v\n\n", data)

			fout, err := os.OpenFile(DataFile, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)

			if err != nil {
				continue
			}

			for _, buf := range data {
				fout.WriteString(buf)
				fout.WriteString("\n")
			}

			fout.Close()

		}
	}
}

func IsIP(ip string) (b bool) {
	if m, _ := regexp.MatchString("^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$", ip); !m {
		return false
	}
	return true
}

func CrawlData(htmlBody string, res chan []string) {

	doc := soup.HTMLParse(htmlBody)
	trs := doc.Find("table", "id", "table").Find("tbody").FindAll("tr")

	infos := make([]string, 10)
	for _, tr := range trs {
		tds := tr.FindAll("td")

		if len(tds) > 6 {
			ip := tds[1].Text()

			if !IsIP(ip) {
				continue
			}

			// find client info
			clientInfo := tds[5].Text()
			if !strings.HasPrefix(clientInfo, "Ge") {
				continue
			}

			infos = append(infos, ip)

		} else {
			fmt.Printf("<- error when parsing html\n")
		}
	}
	res <- infos
}
