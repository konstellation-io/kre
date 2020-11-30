package integrationtests

import (
	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/config"
	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/graphql"
)

type TestRunner struct {
	gqManager *graphql.GQManager
	State     map[string]interface{}
}

func NewTestRunner() TestRunner {
	cfg := config.NewConfig()
	gqManager := graphql.NewGQManager(cfg)

	return TestRunner{
		gqManager: gqManager,
		State:     map[string]interface{}{},
	}
}

func (r *TestRunner) Reset() {
	r.State = map[string]interface{}{}
}
