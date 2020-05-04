# Portfolio

Hello guys !

This is a small personal project to create my portfolio in elixirlang using phoenix framework as I'm diving into functionnal programming I thought this would be a great exercise to understand all the concepts behind. Off course documentation and readings are a better way to achieve this aknowledgement, but theory applied on the field is better than just theory. 

Fork me if you can ;). 

- Built on Phoenix framework
- PostgreSQL DB
- Docker-compose configuration
- CI integration 

## Requirements
If you use docker you will only need:
* Docker;
* Docker-Compose;

If not, to run this project, you will need to install the following dependencies on your system:

- [Elixir](https://elixir-lang.org/install.html)
- [Phoenix](https://hexdocs.pm/phoenix/installation.html)
- [PostgreSQL](https://www.postgresql.org/download/macosx/)

## Project setup

Without docker : 

You will need to install all the requirements on your environement and then: 

- Start your postgres DB on port `5432`.
- Run ecto migrations with `mix ecto migrate` ⚠️ Do not forget to change the DB configuration in `config/dev.ex`⚠️.
- Start phoenix server `mix phx.server`.
- Go to `http://localhost:4000`.

With docker : 

Refer to the [DOCKER.md](DOCKER.md)


## Development process

1. Most of the time I assign a ticket on the [application board](https://github.com/JackMaarek/portfolio/projects/2). Those application tickets are technical tasks coming from user stories that are more about the needs of the project itself detailed in the [project board](https://github.com/JackMaarek/portfolio/projects/1). As I want to follow agile methodology this process has great advantages.
2. When I start working on a ticket, I move the concerned one to `In Progress`.
3. Then I create a branch specifically for this ticket with a name that follows the [conventions specified below](#branch-naming-convention).
4. I Commit regularly at each significant step with unambiguous commit messages (see [COMMIT_CONVENTIONS](COMMIT_CONVENTIONS.md) file).
5. When a feature is nearly done I create a merge request that follows the [conventions specified below](#pull-requests-pr) targeting develop or master branch depending on the complexity.
6. On the [appplication board](https://github.com/JackMaarek/Elm-project/projects/2), move the ticket to the status `In Review`.
7. Assign the merge request to a maintainer, still me in those kind of projects.
8. Wait until the CI checks are passed, if not some back and forth will be needed to fix the issues.
9. The pull request will then be merged into the develop branch and the concerned ticket will be moved to `Done`.
10. If everything's working fine I rebase master from develop.
11. Finally I move the user story in th [project board](https://github.com/JackMaarek/portfolio/projects/1) to `Done.

## Pull requests (PR)

Pull requests in this project follow two conventions by using the templates available in the [ISSUE_TEMPLATE](.github/ISSUE_TEMPLATE) folder :

- Adding a new feature should use the [FEATURE_REQUEST](.github/ISSUE_TEMPLATE/FEATURE_REQUEST.md) template.
- Reporting a bug should use the [BUG_REPORT](.github/ISSUE_TEMPLATE/BUG_REPORT.md) template.

If the merge request is still work in progress, I add a "WIP: " (Work In Progress) flag in front of the title. As this is a personal project it is not really relevant but keeping the good habits is a good practice. 

The naming of the PR should follow the same rules as the [COMMIT_CONVENTIONS](COMMIT_CONVENTIONS.md)

## Branch naming convention

The branch should have a name that reflects it's purpose.

It should use the same guidelines as [COMMIT_CONVENTIONS](COMMIT_CONVENTIONS.md) (`feat`, `fix`, `build`, `perf`, `docs`), followed by an underscore (`_`) and a very quick summary of the subject in [kebab case][1].

Example: `feat_add-image-tag-database-relation`.

## Git hooks
Git hooks are placed in `.git/hooks`. 

> No hooks for now

## Linter

For now the only existing linter is [Credo](https://github.com/rrrene/credo) for backend part.

## Continuous Integration (CI)

A CI pipeline is configured for this project and is accessible in the [CI.yaml](.github/workflows/CI.yaml) file.

The pipeline will run 3 different jobs: 
- Dependencies check
- Linter
- Tests

The pipeline will be triggered automatically when creating a new Pull Request and on each push on it.
It will also be triggered on push on `master`and `dev` branches.

I could have only one job instead of repeating the workflow for each one and combine those through different steps directly. This could save earth's energy consumption #greenThinking.

## Featured documentation

<!--API documentation : [link](source/backend/README.md)-->

<!--Front documentation : [link](source/frontend/README.md)-->

Wiki : [link](https://github.com/JackMaarek/portfolio/wiki)

[1]: https://medium.com/better-programming/string-case-styles-camel-pascal-snake-and-kebab-case-981407998841
