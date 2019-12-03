package auth

import (
	"bytes"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gopkg.in/gomail.v2"
	"html/template"
	"strconv"
)

type VerificationCodeSMTPTransport struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewSMTPLoginLinkTransport(cfg *config.Config, logger logging.Logger) *VerificationCodeSMTPTransport {
	return &VerificationCodeSMTPTransport{
		cfg,
		logger,
	}
}

func (s VerificationCodeSMTPTransport) Send(recipient, verificationCode string) error {
	frontEndBaseURL := s.cfg.Admin.FrontEndBaseURL
	loginLink := fmt.Sprintf("%s/signin/%s", frontEndBaseURL, verificationCode)
	subject := "Konstellation Login Link"
	messageText := fmt.Sprintf("Your login link:\n%s", loginLink)

	var signInTmpl = template.Must(template.ParseFiles("templates/signin-email.html"))
	var body bytes.Buffer
	data := map[string]string{
		"LoginLink":                         loginLink,
		"VerificationCodeDurationInMinutes": strconv.Itoa(s.cfg.Auth.VerificationCodeDurationInMinutes),
	}
	if err := signInTmpl.Execute(&body, data); err != nil {
		return err
	}

	return s.sendEmail(recipient, subject, messageText, body.String())
}

func (s VerificationCodeSMTPTransport) sendEmail(recipient, subject, messageText, messageHTML string) error {
	if !s.cfg.SMTP.Enabled {
		s.logger.Info("SMTP is disabled, the email will be printed in console:")
		s.logger.Info(messageText)
		return nil
	}

	m := gomail.NewMessage()

	// Set the alternative part to plain text.
	m.AddAlternative("text/plain", messageText)

	// Set the main email part to use HTML.
	m.SetBody("text/html", messageHTML)

	m.SetHeaders(map[string][]string{
		"From":    {m.FormatAddress(s.cfg.SMTP.Sender, s.cfg.SMTP.SenderName)},
		"To":      {recipient},
		"Subject": {subject},
	})

	d := gomail.NewDialer(s.cfg.SMTP.Host, s.cfg.SMTP.Port, s.cfg.SMTP.User, s.cfg.SMTP.Pass)
	return d.DialAndSend(m)
}
