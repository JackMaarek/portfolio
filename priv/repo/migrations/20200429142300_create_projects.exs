defmodule Portfolio.Repo.Migrations.CreateProjects do
  use Ecto.Migration

  def change do
    create table(:projects) do
      add :name, :string
      add :content, :string
      add :is_published, :boolean, default: false, null: false

      timestamps()
    end

  end
end
