defmodule Porfolio.CRM.Project do
  use Ecto.Schema
  import Ecto.Changeset

  schema "projects" do
    field :content, :string
    field :is_published, :boolean, default: false
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(project, attrs) do
    project
    |> cast(attrs, [:name, :content, :is_published])
    |> validate_required([:name, :content, :is_published])
  end
end
