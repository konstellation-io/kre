package integrationtests

import (
	"context"
	"crypto/tls"
	"fmt"
	"strconv"
	"time"

	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/entity"

	"github.com/cucumber/godog"
	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/pb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

const CallTimeout = 10

func (r *TestRunner) theVersionStatusIs(versionID, expectedStatus string) error {
	status, err := r.gqManager.GetVersionStatus(versionID)
	if err != nil {
		return err
	}

	if expectedStatus != status {
		if status == entity.VersionStatusPublished && expectedStatus == entity.VersionStatusStarted {
			return r.gqManager.VersionUnpublish(versionID, "set to expected status")
		} else if status == entity.VersionStatusStarted && expectedStatus == entity.VersionStatusPublished {
			return r.gqManager.VersionPublish(versionID, "set to expected status")
		} else {
			// nolint:goerr113
			return fmt.Errorf("the version status is %s and should be %s", status, expectedStatus)
		}
	}

	return nil
}

func (r *TestRunner) theAPIClientPublishTheVersionSendingComment(versionID, comment string) error {
	return r.gqManager.VersionPublish(versionID, comment)
}

func (r *TestRunner) theAPIClientUnpublishTheVersionSendingComment(versionID, comment string) error {
	return r.gqManager.VersionUnpublish(versionID, comment)
}

func (r *TestRunner) theAPIClientCallsToTheWorkflowTestAt(entrypointAddress string) error {
	var tlsConf tls.Config
	tlsConf.InsecureSkipVerify = true

	conn, err := grpc.Dial(entrypointAddress, grpc.WithTransportCredentials(credentials.NewTLS(&tlsConf)))
	if err != nil {
		return err
	}
	defer conn.Close()
	client := pb.NewEntrypointClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), CallTimeout*time.Second)
	defer cancel()

	res, err := client.WorkflowTest(ctx, &pb.Message{})
	if err != nil {
		return err
	}

	r.State["last_response.go_runner_success"] = strconv.FormatBool(res.GoRunnerSuccess)
	r.State["last_response.py_runner_success"] = strconv.FormatBool(res.PyRunnerSuccess)

	return nil
}

func (r *TestRunner) theWorkflowResponseContainsAPropertyEqualTo(propName, expectedValue string) error {
	if r.State["last_response."+propName] != expectedValue {
		// nolint:goerr113
		return fmt.Errorf("the workflow response property \"%s\" contains an unexpected value \"%s\", should be \"%s\"",
			propName, r.State[propName], expectedValue)
	}

	return nil
}

func (r *TestRunner) InitVersionScenarios(ctx *godog.ScenarioContext) {
	ctx.Step(`^the API client publish the version "([^"]*)" sending "([^"]*)" comment$`, r.theAPIClientPublishTheVersionSendingComment)
	ctx.Step(`^the API client unpublish the version "([^"]*)" sending "([^"]*)" comment$`, r.theAPIClientUnpublishTheVersionSendingComment)
	ctx.Step(`^the version "([^"]*)" status is "([^"]*)"$`, r.theVersionStatusIs)
	ctx.Step(`^the API client calls to the workflow WorkflowTest at "([^"]*)"$`, r.theAPIClientCallsToTheWorkflowTestAt)
	ctx.Step(`^the workflow response contains a property "([^"]*)" equal to "([^"]*)"$`, r.theWorkflowResponseContainsAPropertyEqualTo)
}
