package main

import (
	"bytes"
	"context"
	"encoding/hex"
	"fmt"
	"log"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rpc"
)

// BytesToHash sets b to hash.
// If b is larger than len(h), b will be cropped from the left.
func BytesToHash(b []byte) common.Hash {
	var h common.Hash

	if len(b) > 32 {
		b = b[len(b)-32:]
	}

	copy(h[32-len(b):], b)
	return h
}

func HexStringToTxHash(s string) (common.Hash, error) {

	if len(s) > 1 {
		if s[0:2] == "0x" || s[0:2] == "0X" {
			s = s[2:]

			hexBytes, _ := hex.DecodeString(s)
			return BytesToHash(hexBytes), nil

		} else {
			return [32]byte{}, fmt.Errorf("Not hex string!\n")
		}

	} else {
		return [32]byte{}, fmt.Errorf("Not hex string!\n")
	}
}

func main() {
	rpccli, err := rpc.Dial("wss://ropsten.infura.io/ws")
	if err != nil {
		log.Fatalln(err)
	}

	client := (*rpc.Client)(rpccli)
	subch := make(chan string, 1024)

	sub, err := client.EthSubscribe(context.Background(), subch, "newPendingTransactions")
	if err != nil {
		log.Fatalln(err)
	}

	var (
		abort  chan struct{}
		target common.Address
	)
	txs := make(chan *types.Transaction, 1024)

	for {
		select {
		case hash := <-subch:
			bytesHash, err := HexStringToTxHash(hash)

			if err != nil {
				continue
			}

			go func(h common.Hash, results chan<- *types.Transaction) {
				ethc := ethclient.NewClient(rpccli)
				tx, _, err := ethc.TransactionByHash(context.Background(), h)

				if err != nil {
					return
				} else {
					txs <- tx
				}
			}(bytesHash, txs)

		case err := <-sub.Err():
			log.Fatalln(err)

		case <-abort:
			return

		case tx := <-txs:
			var signer types.Signer = types.FrontierSigner{}
			if tx.Protected() {
				signer = types.NewEIP155Signer(tx.ChainId())
			}
			from, _ := types.Sender(signer, tx)

			// We've got a tx hash
			log.Printf("tx: %x\n", tx.Hash())
			log.Println("Now: ", hex.EncodeToString(from[:]))

			if bytes.Equal(target[:], from[:]) {
				go func(t *types.Transaction) {

					// we do something on it
					log.Println("<- We found a tx we want\n")
					Process(t)
				}(tx)
			}

		}
	}

	//TODO: Abort from user
	// go func() {
	// 	n := 1
	// 	if n != 1 {
	// 		abort <- struct{}{}
	// 	}
	// }()
}

func Process(t *types.Transaction) error {
	// We can do something on the specific tx
	return nil
}
