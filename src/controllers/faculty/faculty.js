import {
  getFacultyById,
  getSortedFaculty,
} from "../../models/faculty/faculty.js";

const facultyListPage = (req, res) => {
  const sortBy = req.query.sort || "name";
  const faculty = getSortedFaculty(sortBy);

  res.render("faculty/list", {
    title: "Faculty Directory",
    faculty,
    sortBy,
  });
};

const facultyDetailPage = (req, res, next) => {
  const facultyId = req.params.facultyId;
  const faculty = getFacultyById(facultyId);

  if (!faculty) {
    const error = new Error("Faculty member not found");
    error.status = 404;
    return next(error);
  }

  res.render("faculty/detail", {
    title: faculty.name,
    faculty,
  });
};

export { facultyListPage, facultyDetailPage };