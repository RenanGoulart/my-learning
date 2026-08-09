import { Map, Plus } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { FormField } from "./form-field";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";

it("renders page hierarchy, empty action and semantic status text", () => {
  render(
    <>
      <PageHeader
        eyebrow="Trilha"
        title="React avançado"
        description="Arquitetura"
        icon={Map}
        actions={
          <Button>
            <Plus />
            Novo recurso
          </Button>
        }
      />
      <EmptyState
        icon={Map}
        title="Nenhum recurso ainda"
        description="Adicione o primeiro recurso."
        action={<Button>Adicionar recurso</Button>}
      />
      <StatusBadge status="NOT_STARTED" />
      <StatusBadge status="IN_PROGRESS" />
      <StatusBadge status="COMPLETED" />
    </>,
  );

  expect(
    screen.getByRole("heading", { level: 1, name: "React avançado" }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Adicionar recurso" }),
  ).toBeVisible();
  expect(screen.getByText("Não iniciado")).toBeVisible();
  expect(screen.getByText("Em andamento")).toBeVisible();
  expect(screen.getByText("Concluído")).toBeVisible();
});

it("announces form field errors while retaining description associations", () => {
  render(
    <FormField
      description="Use um nome curto e fácil de reconhecer."
      error="Informe o título."
      id="title"
      label="Título"
    >
      <input />
    </FormField>,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("Informe o título.");
  expect(screen.getByLabelText("Título")).toHaveAttribute(
    "aria-describedby",
    "title-description title-error",
  );
});
