-- Product call (#35 follow-up): a min/max budget range never made sense
-- once helpers already bid their own price on apply (#22) — the poster
-- only needs to state the ceiling they're willing to pay. Drops budget_min
-- and renames budget_max to budget.

alter table public.annonces
  drop column budget_min;

alter table public.annonces
  rename column budget_max to budget;
