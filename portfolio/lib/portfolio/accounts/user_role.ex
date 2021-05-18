defmodule Portfolio.Accounts.UserRole do
  use EctoEnum, type: :user_role, enums: [:admin, :user]
end