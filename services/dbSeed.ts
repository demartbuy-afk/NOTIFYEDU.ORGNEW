import { School, Student, User, UserType, Guard, Teacher, AttendanceLog, Complaint, Message, Announcement, ContactInfo, AttendanceStatus, AttendanceMode, ComplaintStatus, LoginAttempt, FooterInfo, ClassRoutineEntry, PaymentProof, Agent, ExamSession, StudentResult, AcademicWork } from '../types';

export interface DB {
  schools: School[];
  students: Student[];
  guards: Guard[];
  teachers: Teacher[];
  academicWorks: AcademicWork[];
  superAdmins: (User & { password?: string })[];
  attendanceLogs: AttendanceLog[];
  complaints: Complaint[];
  messages: Message[];
  announcements: Announcement[];
  classRoutines: ClassRoutineEntry[];
  paymentProofs: PaymentProof[];
  agents: Agent[];
  examSessions: ExamSession[];
  studentResults: StudentResult[];
  contactInfo: ContactInfo;
  footerInfo: FooterInfo;
  locationQrValue: string;
  nonces: { nonce: string, expiresAt: number, used: boolean }[];
  loginAttempts: { [key: string]: LoginAttempt };
}

export const dbSeed = (): DB => {
  const schoolId = 'springdale_hs';
  
  const students: Student[] = [
    {
      id: 'stu_avi_sharma_1', student_id: 'stu_avi_sharma_1', school_id: schoolId, name: 'Avi Sharma', token: '', type: UserType.Student,
      roll_no: '101', class: '10', parent_phone: '+919876543210', qr_value: JSON.stringify({ student_id: 'stu_avi_sharma_1', school_id: schoolId }),
      password_auto: 'pass1', total_fees: 50000, fees_paid: 45000,
    },
    {
      id: 'stu_riya_patel_2', student_id: 'stu_riya_patel_2', school_id: schoolId, name: 'Riya Patel', token: '', type: UserType.Student,
      roll_no: '102', class: '10', parent_phone: '+919876543211', qr_value: JSON.stringify({ student_id: 'stu_riya_patel_2', school_id: schoolId }),
      password_auto: 'pass2', total_fees: 50000, fees_paid: 25000,
    },
     {
      id: 'stu_karan_singh_3', student_id: 'stu_karan_singh_3', school_id: schoolId, name: 'Karan Singh', token: '', type: UserType.Student,
      roll_no: '201', class: '11', parent_phone: '+919876543212', qr_value: JSON.stringify({ student_id: 'stu_karan_singh_3', school_id: schoolId }),
      password_auto: 'pass3', total_fees: 60000, fees_paid: 0,
    },
  ];

  const guards: Guard[] = [
      {
        id: 'guard_ramesh_1', guard_id: 'guard_ramesh_1', school_id: schoolId, name: 'Ramesh Kumar', token: '', type: UserType.Guard,
        password_auto: 'guard1'
      }
  ];

  const teachers: Teacher[] = [
      {
        id: 'teach_sunita_roy_1', teacher_id: 'teach_sunita_roy_1', school_id: schoolId, name: 'Sunita Roy', subject: 'Mathematics', phone_number: '+919876511111',
        qr_value: JSON.stringify({ teacher_id: 'teach_sunita_roy_1', school_id: schoolId }), type: UserType.Teacher,
      }
  ];

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const attendanceLogs: AttendanceLog[] = [
    // Today
    { log_id: 'log1', entity_id: 'stu_avi_sharma_1', entity_name: 'Avi Sharma', entity_type: 'student', timestamp: new Date(new Date().setHours(9, 5, 0)).toISOString(), status: AttendanceStatus.IN, mode: AttendanceMode.QR, school_id: schoolId },
    // Yesterday
    { log_id: 'log2', entity_id: 'stu_avi_sharma_1', entity_name: 'Avi Sharma', entity_type: 'student', timestamp: new Date(new Date(yesterday).setHours(9, 1, 0)).toISOString(), status: AttendanceStatus.IN, mode: AttendanceMode.FINGERPRINT, school_id: schoolId },
    { log_id: 'log3', entity_id: 'stu_avi_sharma_1', entity_name: 'Avi Sharma', entity_type: 'student', timestamp: new Date(new Date(yesterday).setHours(16, 0, 0)).toISOString(), status: AttendanceStatus.OUT, mode: AttendanceMode.MANUAL, school_id: schoolId },
    { log_id: 'log4', entity_id: 'stu_riya_patel_2', entity_name: 'Riya Patel', entity_type: 'student', timestamp: new Date(new Date(yesterday).setHours(9, 10, 0)).toISOString(), status: AttendanceStatus.IN, mode: AttendanceMode.QR, school_id: schoolId },
    // 2 days ago
    { log_id: 'log5', entity_id: 'stu_avi_sharma_1', entity_name: 'Avi Sharma', entity_type: 'student', timestamp: new Date(new Date(twoDaysAgo).setHours(8, 59, 0)).toISOString(), status: AttendanceStatus.IN, mode: AttendanceMode.FINGERPRINT, school_id: schoolId },
    { log_id: 'log6', entity_id: 'stu_karan_singh_3', entity_name: 'Karan Singh', entity_type: 'student', timestamp: new Date(new Date(twoDaysAgo).setHours(10, 30, 0)).toISOString(), status: AttendanceStatus.IN, mode: AttendanceMode.MANUAL, school_id: schoolId },
    { log_id: 'log7', entity_id: 'stu_riya_patel_2', entity_name: 'Riya Patel', entity_type: 'student', timestamp: new Date(new Date(twoDaysAgo).setHours(9, 0, 0)).toISOString(), status: AttendanceStatus.ABSENT, mode: AttendanceMode.SYSTEM, school_id: schoolId },
    // Teacher log
    { log_id: 'log8', entity_id: 'teach_sunita_roy_1', entity_name: 'Sunita Roy', entity_type: 'teacher', timestamp: new Date(new Date(yesterday).setHours(8, 45, 0)).toISOString(), status: AttendanceStatus.IN, mode: AttendanceMode.QR, school_id: schoolId },

  ];

  return {
    schools: [
      {
        id: schoolId, name: 'Springdale High School', token: '', type: UserType.School, address: '123 Education Lane, Knowledge City',
        contact_no: '+91 11 4123 4567', status: 'ACTIVE', subscription_expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), password: 'password',
        opening_time: '09:00',
        closing_time: '16:00',
        payment_qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABlBMVEX///8AAABVwtN+AAABaklEQVRIx2MYBCMghtAASJGlw5CAycaH/d+yE3L9f/9H/49eC4hp//+x/yN/pyB10oBNIDkCqRM2gSwZJEfQ9P9/nP/x/+f/35lM6uA1SHIAUicMG2dSyIDRgswMkCNoevL/H3t3yPz/Dx5++v+r/z8k7wOSIzBpyAZkI0gZgSwZZEfQ9P+v/v/z/6+3gRz/T0gZgCwZZEfQ9P8/sX+GzP/f4v/f+P/L/3+R/O8DkidgmhID2YQgZYAsGWQnoOn//xn/T5j8/7v9/9f+n6H8/yOSDCCbJDMkZEA0IMsAkCOoenL/n/h/1//f4F9I+v8hyQFIjYBsBJTNAbIkIEdQ9f/flf8vkvx/6v/f/f/b/5P9/yM5AkiVjGyAlAGyZCA7gWb//xv/P0Tz/x/9/wP5/2/+/4PkCKROGDbOpJABowWZGSBH0PTk/z/+7pD5/x88/PT/V/9/SN4HJEfQdCOQnAHJCSAnB3IykBwAZjQYyA6A/jsAkNpdN6l9pIAAAAAASUVORK5CYII=",
      },
    ],
    students,
    guards,
    teachers,
    academicWorks: [],
    superAdmins: [
      { id: 'admin', name: 'Portal Admin', token: '', type: UserType.SuperAdmin, password: 'admin' },
      { id: 'yuvraj1203', name: 'Yuvraj', token: '', type: UserType.SuperAdmin, password: 'Yuvraj@1203#₹__' }
    ],
    attendanceLogs,
    complaints: [
        { complaint_id: 'comp1', student_id: 'stu_riya_patel_2', student_name: 'Riya Patel', timestamp: new Date().toISOString(), text: 'The bus is frequently late in the mornings.', status: ComplaintStatus.OPEN, submitted_by_name: 'Riya Patel', submitted_by_role: 'Student' }
    ],
    messages: [
        { message_id: 'msg1', student_id: 'stu_karan_singh_3', text: 'Dear Parent, Karan needs to submit his science project by this Friday. Please ensure he completes it on time. Thank you.', timestamp: new Date().toISOString() }
    ],
    announcements: [
        { announcement_id: 'ann1', school_id: schoolId, title: 'Annual Sports Day', content: 'The Annual Sports Day will be held on the 25th of this month. All students are requested to participate.', timestamp: new Date().toISOString() }
    ],
    classRoutines: [],
    paymentProofs: [],
    agents: [],
    examSessions: [],
    studentResults: [],
    contactInfo: {
        title: 'Register Your School',
        description: 'To get started with NotifyEdu, please contact our support team. We will guide you through the setup process and provide your school\'s administrative credentials.',
        email: 'helpnotifyedu@gmail.com',
        phone: '+91 98765 43210',
    },
    footerInfo: {
        navLinks: [
            { title: 'Features', href: '#features' },
            { title: 'How It Works', href: '#how-it-works' },
            { title: 'Teachers', href: '/teacher-portal' },
            { title: 'Contact', href: '#contact' },
        ],
        email: 'helpnotifyedu@gmail.com',
        phone: '+91 99999 88888',
        copyright: '© {year} NotifyEdu. All rights reserved.',
    },
    locationQrValue: 'SCHOOL_GATE_QR_CHECK_IN_V1',
    nonces: [],
    loginAttempts: {},
  };
};