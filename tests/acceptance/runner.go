package integrationtests

import (
	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/config"
	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/graphql"
)

type TestRunner struct {
	gqManager *graphql.GQManager
	State     map[string]interface{}
}

func NewTestRunner() (TestRunner, error) {
	cfg := config.NewConfig()
	gqManager, err := graphql.NewGQManager(cfg)
	if err != nil {
		return TestRunner{}, err
	}

	return TestRunner{
		gqManager: gqManager,
		State:     map[string]interface{}{},
	}, nil
}

func (r *TestRunner) Reset() {
	r.State = map[string]interface{}{}
}
