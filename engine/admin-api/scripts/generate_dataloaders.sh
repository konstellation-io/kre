#!/bin/bash

cd adapter/dataloader
go run github.com/vektah/dataloaden UserLoader string *github.com/konstellation-io/kre/admin/admin-api/domain/entity.User
go run github.com/vektah/dataloaden VersionLoader string *github.com/konstellation-io/kre/admin/admin-api/domain/entity.Version
