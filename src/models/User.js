const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, required: false }, 
  biography: { type: String, required: false },
  country: { type: String, required: false },
  city: { type: String, required: false },
  postal: { type: String, required: false },
  address: { type: String, required: false },
  phone: { type: String, required: false },
  role: { type: String, enum: ['user', 'teacher', 'admin'], default: 'user' }, 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For teachers
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For students
  schedule: [
    {
      date: { type: String, required: false }, // e.g., '2024-09-05'
      startTime: { type: String, required: false }, // e.g., '14:00'
      endTime: { type: String, required: false }, // e.g., '15:00'
      dayOfWeek: { type: String, required: false }, // e.g., 'Monday'
      teacherName: { type: String, required: false }, // Teacher's name
      studentName: { type: String, required: false }, // Student's name
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Student's ID
    }
  ],
});

// Hash the password before saving the user model
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('password')) {
    const document = this;
    bcrypt.hash(document.password, 10, function(err, hashedPassword) {
      if (err) {
        next(err);
      } else {
        document.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});

userSchema.methods.isCorrectPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};


userSchema.statics.assignStudentToTeacher = async function(teacherId, studentId, events) {
  try {
    const teacher = await this.findById(teacherId);
    const student = await this.findById(studentId);

    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Teacher not found or not a teacher.');
    }
    if (!student || student.role !== 'user') {
      throw new Error('Student not found or not a student.');
    }

    const updatedEvents = events.map(event => ({
      ...event,
      studentId: student._id,  
    }));

    teacher.students.push(student._id);
    student.teacher = teacher._id;

    student.schedule = [...(student.schedule || []), ...updatedEvents];
    teacher.schedule = [...(teacher.schedule || []), ...updatedEvents];
    
    await teacher.save();
    await student.save();

    return 'Teacher updated successfully';
  } catch (error) {
    throw new Error(`Failed to assign student to teacher: ${error.message}`);
  }
};




const User = mongoose.model('User', userSchema);

module.exports = User;
