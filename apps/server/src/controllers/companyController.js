import Company from "../models/companyModel.js";

// Get all companies
export const getAllCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({ active: true }).populate(
            "facilities"
        );
        res.status(200).json(companies);
    } catch (error) {
        next(error);
    }
};

// Get company by ID
export const getCompanyById = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id).populate(
            "facilities"
        );

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json(company);
    } catch (error) {
        next(error);
    }
};

// Create new company
export const createCompany = async (req, res, next) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        next(error);
    }
};

// Update company
export const updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json(company);
    } catch (error) {
        next(error);
    }
};

// Delete company
export const deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        next(error);
    }
};
