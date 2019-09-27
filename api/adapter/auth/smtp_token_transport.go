package auth

import (
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/usecase/logging"
	"gopkg.in/gomail.v2"
)

type TransportSMTP struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewTransportSMTP(cfg *config.Config, logger logging.Logger) *TransportSMTP {
	return &TransportSMTP{
		cfg,
		logger,
	}
}

func (s TransportSMTP) Send(recipient, subject, message string) error {
	if !s.cfg.SMTP.Enabled {
		s.logger.Info("SMTP is disabled, the email will be printed in console:")
		s.logger.Info(message)
		return nil
	}

	m := gomail.NewMessage()

	// Set the main email part to use HTML.
	// m.SetBody("text/html", HtmlBody)
	// Set the alternative part to plain text.
	m.AddAlternative("text/plain", message)

	m.SetHeaders(map[string][]string{
		"From":    {m.FormatAddress(s.cfg.SMTP.Sender, s.cfg.SMTP.SenderName)},
		"To":      {recipient},
		"Subject": {subject},
	})

	d := gomail.NewDialer(s.cfg.SMTP.Host, s.cfg.SMTP.Port, s.cfg.SMTP.User, s.cfg.SMTP.Pass)
	return d.DialAndSend(m)
}
