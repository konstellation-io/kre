#!/bin/bash

cd adapter/dataloader
go run github.com/vektah/dataloaden UserLoader string *gitlab.com/konstellation/kre/admin-api/domain/entity.User
go run github.com/vektah/dataloaden VersionLoader string *gitlab.com/konstellation/kre/admin-api/domain/entity.Version
