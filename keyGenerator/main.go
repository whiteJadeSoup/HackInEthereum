package main

import (
	"encoding/hex"
	"fmt"
)

func main() {

	// for i := 0; i < 10; i++ {
	// 	fmt.Printf("\n\n New round: %v ->", i)
	// 	key := NewKeyPair()

	// 	fmt.Printf("<- pk: %x\n", key.PublicKey)
	// 	fmt.Printf("<- address: %x\n", key.EAddress)
	// }

	results := make(chan *Key)
	SearchAddressWithMode(results, "1", false)

	key := <-results
	fmt.Printf("\n\nAddress: %x\n", key.EAddress)
	fmt.Printf("pubKey: %x\n\n", key.PublicKey)

	bb := BigintToByteArr(key.privateKey.D)

	fmt.Printf("privateKey: %v\n", hex.EncodeToString(bb[:]))
}
