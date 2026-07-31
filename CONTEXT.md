# My Learning

Personal study management context for organizing learning paths, resources, and daily study continuity.

## Language

**Trilha**:
A planned learning path around a subject or goal, made of manually ordered study resources and progress signals. Its order guides study but never restricts which resource can be accessed or progressed.
_Avoid_: Course, topic, study

**Ordem da trilha**:
A user-defined sequence of Recursos that can be rearranged at any time and is advisory rather than mandatory.
_Avoid_: Prerequisite, locked sequence

**Progresso da trilha**:
A derived value based on the proportion of Recursos marked `Concluído`; a Trilha without Recursos has 0% progress and is not complete. A Trilha is complete only when it has at least one Recurso and all its Recursos are complete.
_Avoid_: Manually assigned trail status

**Trilha ativa**:
A Trilha that has at least one Recurso and is not complete. It is a derived classification used for the operational Dashboard, not a manually assigned status.
_Avoid_: Empty trail, completed trail, archived trail

**Continuar estudando**:
The Dashboard selection of up to five Recursos currently `Em andamento`, ordered by most recent update. When none are in progress, it considers recently updated Trilhas ativas and selects each one's first `Não iniciado` Recurso according to manual order.
_Avoid_: Recently viewed, browsing history

**Recurso**:
A study item attached to a Trilha, categorized as Material or Prática and tracked as `Não iniciado`, `Em andamento`, or `Concluído`.
_Avoid_: Task, module, item

**Material**:
A Recurso primarily used to consume or consult content, classified as `Curso`, `Documentação`, `Artigo`, `Vídeo`, `Livro`, or `Outro`. It may point to an absolute external `http` or `https` URL.
_Avoid_: Practice activity

**Prática**:
A Recurso manually created by the user to exercise knowledge. Its supported formats are `Questão`, `Problema`, `Projeto` with explicit requirements, and `Flashcard` with a front and back.
_Avoid_: Material, formal assessment

**Projeto**:
A Prática defined by a prompt and a manually ordered checklist with at least one non-empty requirement; it also represents short scenario-based exercises. Requirement completion is tracked independently and never changes the Recurso status automatically.
_Avoid_: Mini-case, automatically completed project

**Flashcard**:
A Prática with a required, manually authored front and back. Reviewing it reveals the back without saving what the user tried to recall.
_Avoid_: Resposta de prática, question

**Resposta de prática**:
The user's optional current free-text response to a Prática other than a Flashcard. It is saved without automatic correction or attempt history, and the user marks the Prática complete manually.
_Avoid_: Submission, graded answer, attempt

**Status do recurso**:
The resource lifecycle with exactly three states: `Não iniciado`, `Em andamento`, and `Concluído`.
_Avoid_: Paused, archived, backlog

**Check-in de estudo**:
An explicit daily record that confirms the user studied on its `America/Sao_Paulo` calendar date, independent of resource progress or a time-based goal; manual creation cannot be backdated or future-dated. Its optional duration is informational and ranges from 1 to 1,440 whole minutes; note and duration can be changed, or the record deleted, until that day ends, after which it is read-only.
_Avoid_: Session, progress update, completed goal

**Streak**:
The number of consecutive `America/Sao_Paulo` calendar days with at least one Check-in de estudo. It remains current through the end of the day after the latest Check-in and resets after a full missed day.
_Avoid_: Total study days, score

**Melhor streak**:
The longest historical sequence of consecutive `America/Sao_Paulo` calendar days with Check-ins de estudo.
_Avoid_: Current streak, total Check-ins

**Snapshot de exportação**:
A versioned complete backup of Trilhas, Recursos, Respostas de prática, project requirements, and Check-ins de estudo. Importing it replaces the current dataset rather than merging records.
_Avoid_: Incremental backup, synchronization file
