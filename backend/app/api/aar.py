from fastapi import APIRouter, Depends, HTTPException, Query, Response
from backend.app.schemas.contracts import AARSummary
from backend.app.services.session_service import session_service
from backend.app.reports.aar_builder import AARBuilder
from backend.app.reports.html_report import HTMLReportGenerator
from backend.app.reports.pdf_report import PDFReportGenerator

router = APIRouter(prefix="/sessions/{session_id}/aar", tags=["AAR"])

@router.get("", response_model=AARSummary)
def get_aar_summary(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return AARBuilder.build_aar(instance)

@router.get("/export")
def export_aar(session_id: str, format: str = Query(default="html", pattern="^(html|pdf|json)$")):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")

    aar = AARBuilder.build_aar(instance)

    if format == "json":
        return aar.model_dump(mode="json")
    elif format == "html":
        html_content = HTMLReportGenerator.generate(aar)
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=AAR_{session_id}.html"}
        )
    elif format == "pdf":
        pdf_bytes = PDFReportGenerator.generate_pdf(aar)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=AAR_{session_id}.pdf"}
        )
