defmodule Portfolio.Repo.Migrations.AddRoleToUsers do
  use Ecto.Migration
  alias Portfolio.Accounts.UserRole

  def change do
    UserRole.create_type()

    alter table(:users) do
      add :role, :user_role
    end
  end
end
