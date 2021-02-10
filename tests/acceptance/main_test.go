package integrationtests_test

import (
	"flag"
	"log"
	"os"
	"testing"

	integrationtests "gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests"

	"github.com/cucumber/godog"
	"github.com/cucumber/godog/colors"
)

func TestMain(m *testing.M) {
	var opts = godog.Options{
		Output: colors.Colored(os.Stdout),
		Format: "progress",
	}

	godog.BindFlags("godog.", flag.CommandLine, &opts)

	flag.Parse()
	opts.Paths = flag.Args()

	testRunner, err := integrationtests.NewTestRunner()
	if err != nil {
		log.Fatalf("unexpected error with integration tests runner: %p \n", err)
	}

	status := godog.TestSuite{
		Name: "godogs",
		ScenarioInitializer: func(ctx *godog.ScenarioContext) {
			ctx.BeforeScenario(func(*godog.Scenario) {
				testRunner.Reset()
			})

			testRunner.InitSettingsScenarios(ctx)
			testRunner.InitVersionScenarios(ctx)
		},
		Options: &opts,
	}.Run()

	// Optional: Run `testing` package's logic besides godog.
	if st := m.Run(); st > status {
		status = st
	}

	os.Exit(status)
}
