const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const generateCSVReport = async (userId) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    let csvContent = 'Type,Amount,Date\n';
    transactions.forEach((transaction) => {
      csvContent += `${transaction.type},${transaction.amount},${transaction.createdAt}\n`;
    });

    return csvContent;
  } catch (error) {
    throw new Error('Failed to generate CSV report');
  }
};

const generatePDFReport = async (userId) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    // Generate PDF content (using a library like pdfkit)
    // ...

    return pdfContent;
  } catch (error) {
    throw new Error('Failed to generate PDF report');
  }
};

module.exports = {
  generateCSVReport,
  generatePDFReport,
};
