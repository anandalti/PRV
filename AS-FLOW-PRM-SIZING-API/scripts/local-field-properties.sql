-- Local bootstrap implementation using the checked-in normalized snapshots.
-- Install only in prv_sizing_local. The complete DB backup owns deployed functions.
CREATE OR REPLACE FUNCTION public."FUNC_GetFieldProperties"(_field text, _workflow integer)
RETURNS jsonb LANGUAGE sql STABLE AS $$
WITH expressions AS (
    SELECT fe.*, sfd."FieldName", sfd."FieldType", sfd."UomFieldName", sfd."DimensionName"
    FROM "FieldExpression" fe
    JOIN "SectionFieldDetails" sfd ON sfd."FieldId" = fe."FieldId"
    JOIN "WorkflowSectionDetails" wsd ON wsd."SectionId" = sfd."SectionId"
    WHERE wsd."WorkflowId" = _workflow
), validation_rows AS (
    SELECT e.*, fv."ValidationId", er."ErrorId", er."MessageType", er."MessageId", er."Message", er."DynamicFlag"
    FROM expressions e
    JOIN "FieldValidations" fv ON fv."FieldId" = e."FieldId" AND fv."ValidationId" = e."ExpressionId"
    JOIN "FieldErrors" er ON er."FieldId" = e."FieldId" AND er."ErrorId" = fv."ValidationId"
), related AS (
    SELECT * FROM expressions
    WHERE _field = ANY(string_to_array("TargetField", ',')) OR _field = ANY(string_to_array("FocusedField", ','))
)
SELECT jsonb_build_object(
    'validations', COALESCE((SELECT jsonb_agg(to_jsonb(v)) FROM validation_rows v WHERE _field = ANY(string_to_array(v."FieldName", ','))), '[]'::jsonb),
    'focused_validations', COALESCE((SELECT jsonb_agg(to_jsonb(v)) FROM validation_rows v WHERE _field = ANY(string_to_array(v."FocusedField", ','))), '[]'::jsonb),
    'default_values', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e."Id") FROM related e WHERE EXISTS (
        SELECT 1 FROM "FieldDefaultValue" p WHERE p."FieldId"=e."FieldId" AND p."DefaultValueId"=e."ExpressionId")), '[]'::jsonb),
    'visible_fields', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e."Id") FROM related e WHERE EXISTS (
        SELECT 1 FROM "FieldVisible" p WHERE p."FieldId"=e."FieldId" AND p."VisibleId"=e."ExpressionId")), '[]'::jsonb),
    'disabled_fields', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e."Id") FROM related e WHERE EXISTS (
        SELECT 1 FROM "FieldDisabled" p WHERE p."FieldId"=e."FieldId" AND p."DisabledId"=e."ExpressionId")), '[]'::jsonb),
    'mandatory_fields', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e."Id") FROM related e WHERE EXISTS (
        SELECT 1 FROM "FieldMandatory" p WHERE p."FieldId"=e."FieldId" AND p."MandatoryId"=e."ExpressionId")), '[]'::jsonb),
    'hidden_in_sidebar', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e."Id") FROM related e WHERE EXISTS (
        SELECT 1 FROM "FieldHiddenInSidebar" p WHERE p."FieldId"=e."FieldId" AND p."SideHiddenId"=e."ExpressionId")), '[]'::jsonb)
);
$$;

CREATE OR REPLACE FUNCTION public."FUNC_GetFieldProperties_Optimized"(_field text, _workflow integer)
RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT public."FUNC_GetFieldProperties"(_field, _workflow);
$$;
