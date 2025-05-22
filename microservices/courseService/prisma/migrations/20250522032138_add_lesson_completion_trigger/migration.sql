CREATE TRIGGER update_progress_after_lesson_completion
AFTER INSERT ON LessonCompletion
FOR EACH ROW
BEGIN
  DECLARE total_lessons INT;
  DECLARE completed_lessons INT;
  DECLARE new_progress FLOAT;

  SELECT COUNT(*) INTO total_lessons
  FROM Lesson
  WHERE courseId = (
    SELECT courseId FROM Enrollment WHERE id = NEW.enrollmentId
  );

  SELECT COUNT(*) INTO completed_lessons
  FROM LessonCompletion
  WHERE enrollmentId = NEW.enrollmentId;

  IF total_lessons > 0 THEN
    SET new_progress = (completed_lessons / total_lessons) * 100;
  ELSE
    SET new_progress = 0;
  END IF;

  UPDATE Enrollment
  SET progressPercentage = new_progress
  WHERE id = NEW.enrollmentId;
END;
