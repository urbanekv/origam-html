CREATE PROCEDURE restoreWidgetSectionTestMaster
AS
DELETE FROM [dbo].[WidgetSectionTestDetailDetail];
DELETE FROM [dbo].[WidgetSectionTestDetail];
DELETE FROM [dbo].[WidgetSectionTestMaster];