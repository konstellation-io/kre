package processor

import "strings"

func getRuntimeFromSubject(subjectWildcard, subject string) string {
	subjectPrefix := strings.Trim(subjectWildcard, "*")
	return strings.Replace(subject, subjectPrefix, "", 1)
}
