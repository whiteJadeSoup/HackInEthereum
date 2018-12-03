package main

import (
	"encoding/hex"
	"fmt"
	"strings"
	"sync"
)

func SearchAddressWithMode(results chan<- *Key, prefix string, mode bool) error {

	var (
		pg     sync.WaitGroup
		abort  = make(chan struct{})
		locals = make(chan *Key)
	)

	var fn func(s, prefix string) bool
	if mode {
		fn = func(s, prefix string) bool {
			return strings.HasPrefix(s, prefix)
		}
	} else {
		fn = func(s, suffix string) bool {
			return strings.HasSuffix(s, suffix)
		}
	}

	for i := 0; i < 10; i++ {
		pg.Add(1)
		go func(fix string, abort chan struct{}, found chan *Key) {
			defer pg.Done()
			goFound(fix, abort, found, fn)
		}(prefix, abort, locals)
	}

	go func() {
		var result *Key
		select {
		case result = <-locals:
			select {
			case results <- result:

			default:
				fmt.Printf("-> Not found yet...\n")
			}
		}
		pg.Wait()
	}()

	return nil
}

func goFound(prefix string, abort chan struct{}, found chan *Key, fn func(string, string) bool) {

search:
	for {
		select {
		case <-abort:
			fmt.Printf("<- some goroutine found key!\n")
			fmt.Printf("<- I will exit!\n")
			break search

		default:
			newKey := NewKeyPair()

			addressStr := hex.EncodeToString(newKey.EAddress[:])
			fmt.Printf("<- Someone found address: %s\n", addressStr)

			if fn(addressStr, prefix) {
				select {
				case found <- newKey:
					fmt.Printf("->> I've found the key!\n")
					close(abort)
				case <-abort:
					fmt.Printf("<- ???\n")
				}
				break search
			}

		}
	}
}
