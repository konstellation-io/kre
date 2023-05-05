package token

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type Config struct {
	SigninKey interface{}
}

type UserRoles struct {
	UserId       string
	RealmAccess  RealmAccess
	ProductRoles ProductRoles
}

type Parser struct {
	parser *jwt.Parser
	cfg    *Config
}

func NewParser(cfg *Config) *Parser {
	return &Parser{
		parser: jwt.NewParser(),
		cfg:    cfg,
	}
}

func (p *Parser) GetUserRoles(accessToken string) (*UserRoles, error) {
	claims := &CustomClaims{}
	_, _, err := p.parser.ParseUnverified(accessToken, claims)
	if err != nil {
		return nil, fmt.Errorf("error parsing token: %w", err)
	}

	return &UserRoles{
		UserId:       claims.Subject,
		ProductRoles: claims.ProductRoles,
		RealmAccess:  claims.RealmAccess,
	}, nil
}
