import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Input } from "./input";
import { NativeSelect } from "./native-select";
import { Progress } from "./progress";
import { Textarea } from "./textarea";

it("forwards form semantics and exposes progress accessibly", () => {
  render(
    <>
      <Input aria-label="Título" aria-invalid />
      <Textarea aria-label="Descrição" />
      <NativeSelect aria-label="Categoria" defaultValue="MATERIAL">
        <option value="MATERIAL">Material</option>
      </NativeSelect>
      <Progress label="Progresso da trilha" value={68} />
      <Progress label="Progresso abaixo do limite" value={-1} />
      <Progress label="Progresso acima do limite" value={101} />
    </>,
  );

  expect(screen.getByLabelText("Título")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(screen.getByLabelText("Descrição").tagName).toBe("TEXTAREA");
  expect(screen.getByLabelText("Categoria")).toHaveValue("MATERIAL");
  expect(
    screen.getByRole("progressbar", { name: "Progresso da trilha" }),
  ).toHaveAttribute("aria-valuenow", "68");
  expect(
    screen.getByRole("progressbar", { name: "Progresso abaixo do limite" }),
  ).toHaveAttribute("aria-valuenow", "0");
  expect(
    screen.getByRole("progressbar", { name: "Progresso acima do limite" }),
  ).toHaveAttribute("aria-valuenow", "100");
});
