import {
  getAllCourses,
  getCourseById,
  getSortedSections,
} from "../../models/catalog/catalog.js";

const catalogPage = (req, res, next) => {
  try {
    const coursesObject = getAllCourses();
    const courses = Object.values(coursesObject);

    res.render("catalog/catalog", {
      title: "Course Catalog",
      courses,
    });
  } catch (error) {
    next(error);
  }
};

const courseDetailPage = (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const sortBy = req.query.sort || "time";

    const course = getCourseById(courseId);

    if (!course) {
      const error = new Error("Course not found");
      error.status = 404;
      return next(error);
    }

    const sortedSections = getSortedSections(course.sections, sortBy);

    const sortedCourse = {
      ...course,
      sections: sortedSections,
    };

    res.render("catalog/course-detail", {
        title: course.title,
        course: sortedCourse,
        currentSort: sortBy,
});
  } catch (error) {
    next(error);
  }
};

export {
  catalogPage,
  courseDetailPage,
};