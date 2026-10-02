import os
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from backend.app.schemas.contracts import AARSummary

class PDFReportGenerator:
    @staticmethod
    def generate_pdf(aar: AARSummary) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#475569'),
            spaceAfter=14
        )
        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#0284c7'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=4
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Italic'],
            fontSize=8,
            textColor=colors.HexColor('#64748b'),
            spaceBefore=14
        )

        elements = []

        # Header
        elements.append(Paragraph("MINISTRY OF DEFENCE (MoD) • DEFENCE SERVICES STAFF COLLEGE", subtitle_style))
        elements.append(Paragraph(f"AFTER-ACTION REVIEW: {aar.scenario_title}", title_style))
        elements.append(Paragraph(
            f"Session: {aar.session_id} | Seed: {aar.seed} | Duration: T+{aar.duration_elapsed_seconds}s | Status: COMPLETED",
            subtitle_style
        ))
        elements.append(Spacer(1, 10))

        # Section 1: Metrics
        elements.append(Paragraph("1. Training Indicators & Uncertainty Inventory", heading_style))
        metrics_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Total Decisions", str(aar.total_decisions), "Avg Decision Latency", f"{aar.training_metrics.get('average_decision_latency_seconds', 0)}s"],
            ["Team Messages", str(aar.training_metrics.get('team_coordination_message_count', 0)), "Contradiction Awareness", str(aar.training_metrics.get('contradiction_awareness_rate', '0%'))],
            ["Uncertainty Index", str(aar.uncertainty_budget.total_uncertainty_score), "Stale Data Usage", str(aar.training_metrics.get('stale_information_usage_count', 0))]
        ]
        t_metrics = Table(metrics_data, colWidths=[130, 130, 130, 130])
        t_metrics.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0f172a')),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_metrics)
        elements.append(Spacer(1, 10))

        # Section 2: Decisions
        elements.append(Paragraph("2. Hindsight-Safe Decision Records", heading_style))
        if not aar.decisions:
            elements.append(Paragraph("No command decisions submitted during exercise.", body_style))
        else:
            for d in aar.decisions:
                d_text = f"<b>{d.decision_id} ({d.role})</b>: {d.selected_option} [Confidence: {d.confidence}, T+{d.timestamp}s]<br/>" \
                         f"<i>Rationale:</i> \"{d.rationale}\"<br/>" \
                         f"<i>Decision-Time Evidence:</i> {len(d.information_seen)} feeds available, {len(d.information_delayed)} delayed, {len(d.information_missing)} dropped, {len(d.conflicts_seen)} conflicts.<br/>" \
                         f"<i>Post-Exercise Truth:</i> {d.ground_truth_revelation}"
                elements.append(Paragraph(d_text, body_style))
                elements.append(Spacer(1, 6))

        # Section 3: Information Asymmetry
        elements.append(Spacer(1, 6))
        elements.append(Paragraph("3. Information Asymmetry Matrix", heading_style))
        asym_data = [["Source", "Role", "Status", "Latency Added", "Conflict"]]
        for entry in aar.asymmetry_matrix:
            asym_data.append([
                entry.source_name[:24],
                entry.role,
                entry.delivery_status,
                f"{entry.latency_added_seconds}s",
                "YES" if entry.is_conflicted else "NO"
            ])
        t_asym = Table(asym_data, colWidths=[150, 110, 110, 80, 70])
        t_asym.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_asym)

        # Disclaimer
        elements.append(Spacer(1, 14))
        elements.append(Paragraph(f"INSTRUCTIONAL DISCLAIMER: {aar.disclaimer}", disclaimer_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
