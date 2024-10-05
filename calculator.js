
function calculateCommission(saleValues) {
    let x = 0;
    let y = 0;
    let isFirstEntry = true;
  
    const totalCommission = saleValues.reduce((total, sale) => {
      if (sale < 0) return total;
  
      if (isFirstEntry) {
        y = sale;
        isFirstEntry = false;
        if (sale < 150) {
          return total + sale * 10;
        } else {
          return total + (10 * sale + 500);
        }
      } else {
        if (y < 3000) {
          if (sale < 150) {
            y = y + sale;
            return total + sale * 10;
          } else {
            y = y + sale;
            return total + (10 * sale + 500);
          }
        } else if (y >= 3000 && y < 4000) {
          if (sale < 150) {
            y = y + sale;
            return total + sale * 20;
          } else {
            y = y + sale;
            return total + (20 * sale + 1000);
          }
        } else if (y >= 4000 && y < 5000) {
          if (sale < 150) {
            y = y + sale;
            return total + sale * 30;
          } else {
            y = y + sale;
            return total + (30 * sale + 1500);
          }
        } else if (y >= 5000) {
          if (sale < 150) {
            y = y + sale;
            return total + sale * 40;
          } else {
            y = y + sale;
            return total + (40 * sale + 2000);
          }
        }
      }
    }, 0);
  
    if (y > 3000) x = 0;
  
    return {
      y,
      totalCommission: totalCommission + x,
    };
  }
  
  module.exports = { calculateCommission };
  