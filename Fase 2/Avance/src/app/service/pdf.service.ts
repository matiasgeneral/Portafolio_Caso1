import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  generateCertificate(userData: any) {
    const doc = new jsPDF();

    // Formato del nombre completo
    const fullName = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;

    // Configurar fuente y estilos
    doc.setFont('Helvetica', 'bold');
    
    // Título del certificado
    doc.setFontSize(22);
    doc.text('Certificado de Residencia', 105, 30, { align: 'center' });

    // Subtítulo
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'normal');
    doc.text('Por medio de la presente, se certifica que:', 20, 50);

    // Información del usuario (nombre y dirección)
    doc.setFontSize(14);
    doc.text(`Nombre completo: ${fullName}`, 20, 70);
    doc.text(`Dirección: ${userData.direccion}`, 20, 80);
    doc.text(`RUT: ${userData.rut}`, 20, 90);

    // Fecha de emisión
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 100);

    // Texto principal con ajuste de líneas
    doc.setFontSize(12);
    const contentText = 
      `Este documento certifica que el usuario mencionado reside en la dirección indicada, ` +
      `pudiendo utilizar este documento para los fines que estime conveniente.`;

    // Ajuste de texto largo dentro de los márgenes (170 es el ancho máximo en mm)
    doc.text(contentText, 20, 120, { maxWidth: 170 });

    // Pie de página (firma o sección adicional)
    doc.setFontSize(14);
    doc.text('_________________________', 105, 150, { align: 'center' });
    doc.text('Firma del Responsable', 105, 160, { align: 'center' });

    // Guardar el PDF con un nombre dinámico
    doc.save(`certificado_residencia_${fullName}.pdf`);
  }
}
