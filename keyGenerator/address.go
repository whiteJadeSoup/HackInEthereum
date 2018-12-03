package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"log"
	"math/big"

	"github.com/HackInEthereum/keyGenerator/secp256k1"
	"github.com/HackInEthereum/keyGenerator/sha3"
)

const (
	AddressLength   = 20
	PublickeyLength = 64
	PrivKeyLength   = 32
)

type Address [AddressLength]byte
type Pubkey [PublickeyLength]byte

func (a *Address) SetBytes(b []byte) {
	if len(b) > len(a) {
		b = b[len(b)-AddressLength:]
	}
	copy(a[AddressLength-len(b):], b)
}

func (a *Pubkey) SetBytes(b []byte) {
	if len(b) > len(a) {
		b = b[len(b)-PublickeyLength:]
	}
	copy(a[PublickeyLength-len(b):], b)
}

type Key struct {
	EAddress   Address
	PublicKey  Pubkey
	privateKey *ecdsa.PrivateKey
}

func BytesToAddress(b []byte) Address {
	var a Address
	a.SetBytes(b)

	return a
}

func BytesToPubKey(b []byte) Pubkey {
	var p Pubkey
	p.SetBytes(b)
	return p
}

func Keccak256(data ...[]byte) []byte {
	d := sha3.NewKeccak256()
	for _, b := range data {
		d.Write(b)
	}
	return d.Sum(nil)
}

func PubkeyToAddress(p *ecdsa.PublicKey) [20]byte {
	pk := PublicKeyBytes(p)

	return BytesToAddress(Keccak256(pk[1:])[12:])
}

func PublicKeyBytes(pk *ecdsa.PublicKey) []byte {
	if pk == nil || pk.X == nil || pk.Y == nil {
		return []byte{}
	}

	return elliptic.Marshal(S256(), pk.X, pk.Y)
}

func BigintToByteArr(b *big.Int) [PrivKeyLength]byte {
	var a [PrivKeyLength]byte
	intBytes := b.Bytes()

	if len(intBytes) > len(a) {
		intBytes = intBytes[len(intBytes)-PrivKeyLength:]
	}
	copy(a[PrivKeyLength-len(intBytes):], intBytes)
	return a
}

func S256() elliptic.Curve {
	return secp256k1.S256()
}

func NewKeyPair() *Key {
	privatekeyECDSA, err := ecdsa.GenerateKey(S256(), rand.Reader)

	if err != nil {
		log.Panic("<- Error when newing key pair")
		return nil
	}

	return &Key{
		PubkeyToAddress(&privatekeyECDSA.PublicKey),
		BytesToPubKey(PublicKeyBytes(&privatekeyECDSA.PublicKey)),
		privatekeyECDSA}
}
