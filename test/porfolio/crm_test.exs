defmodule Porfolio.CRMTest do
  use Porfolio.DataCase

  alias Porfolio.CRM

  describe "projects" do
    alias Porfolio.CRM.Project

    @valid_attrs %{content: "some content", is_published: true, name: "some name"}
    @update_attrs %{
      content: "some updated content",
      is_published: false,
      name: "some updated name"
    }
    @invalid_attrs %{content: nil, is_published: nil, name: nil}

    def project_fixture(attrs \\ %{}) do
      {:ok, project} =
        attrs
        |> Enum.into(@valid_attrs)
        |> CRM.create_project()

      project
    end

    test "list_projects/0 returns all projects" do
      project = project_fixture()
      assert CRM.list_projects() == [project]
    end

    test "get_project!/1 returns the project with given id" do
      project = project_fixture()
      assert CRM.get_project!(project.id) == project
    end

    test "create_project/1 with valid data creates a project" do
      assert {:ok, %Project{} = project} = CRM.create_project(@valid_attrs)
      assert project.content == "some content"
      assert project.is_published == true
      assert project.name == "some name"
    end

    test "create_project/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = CRM.create_project(@invalid_attrs)
    end

    test "update_project/2 with valid data updates the project" do
      project = project_fixture()
      assert {:ok, %Project{} = project} = CRM.update_project(project, @update_attrs)
      assert project.content == "some updated content"
      assert project.is_published == false
      assert project.name == "some updated name"
    end

    test "update_project/2 with invalid data returns error changeset" do
      project = project_fixture()
      assert {:error, %Ecto.Changeset{}} = CRM.update_project(project, @invalid_attrs)
      assert project == CRM.get_project!(project.id)
    end

    test "delete_project/1 deletes the project" do
      project = project_fixture()
      assert {:ok, %Project{}} = CRM.delete_project(project)
      assert_raise Ecto.NoResultsError, fn -> CRM.get_project!(project.id) end
    end

    test "change_project/1 returns a project changeset" do
      project = project_fixture()
      assert %Ecto.Changeset{} = CRM.change_project(project)
    end
  end
end
