const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const generateCSVReport = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
    });

    // Generate CSV content
    let csvContent = 'Type,Amount,Date\n';
    transactions.forEach((transaction) => {
      csvContent += `${transaction.type},${transaction.amount},${transaction.createdAt}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('report.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CSV report' });
  }
};

const generatePDFReport = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
    });

    // Generate PDF content (using a library like pdfkit)
    // ...

    res.header('Content-Type', 'application/pdf');
    res.attachment('report.pdf');
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};

module.exports = {
  generateCSVReport,
  generatePDFReport,
};
