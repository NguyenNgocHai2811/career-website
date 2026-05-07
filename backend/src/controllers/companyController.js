const companyRepository = require('../repositories/companyRepository');

const getCompanyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await companyRepository.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    // Concurrently fetch jobs and employees
    const [jobs, employees] = await Promise.all([
      companyRepository.getCompanyJobs(id),
      companyRepository.getCompanyEmployees(id)
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...company,
        jobs,
        employees
      } 
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanyDetails
};
