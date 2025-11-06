import { dbSeed, DB } from './dbSeed';
import { User, School, Student, Guard, Teacher, UserType, AttendanceLog, Complaint, ComplaintStatus, Message, Announcement, AttendanceStatus, AttendanceMode, ContactInfo, FooterInfo, StudentAnalytics, ClassName, ClassRoutineEntry, PaymentProof, PaymentProofStatus, Bus, Agent, ExamSession, StudentResult, AcademicWork } from '../types';
import { db as firebaseDb } from '../firebase-config';
import { ref, get, set, push, remove, update, query, orderByChild, equalTo, startAt, endAt } from "firebase/database";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// --- Token Management ---
const generateToken = (userId: string, userType: UserType): string => {
    const expiry = Date.now() + TOKEN_EXPIRY_MS;
    return btoa(`${userId}:${userType}:${expiry}`);
};

const validateToken = (token: string, requiredTypes?: UserType | UserType[]): { userId: string, userType: UserType } => {
    const dispatchLogout = () => {
        // Use a timeout to ensure the event is dispatched in the next event loop tick, preventing potential React state update race conditions.
        setTimeout(() => window.dispatchEvent(new CustomEvent('force-logout')), 0);
    };

    if (!token) {
        dispatchLogout();
        throw new Error("Authentication token is missing.");
    }

    let decoded;
    try {
        decoded = atob(token);
    } catch (e) {
        dispatchLogout();
        throw new Error("Invalid token. Please log in again.");
    }

    const parts = decoded.split(':');
    if (parts.length !== 3) {
        dispatchLogout();
        throw new Error("Invalid token. Please log in again.");
    }

    const [userId, userType, expiryStr] = parts;
    const expiry = parseInt(expiryStr, 10);

    if (isNaN(expiry) || Date.now() > expiry) {
        dispatchLogout();
        throw new Error('Token expired. Please log in again.');
    }

    if (requiredTypes) {
        const allowedTypes = Array.isArray(requiredTypes) ? requiredTypes : [requiredTypes];
        if (!allowedTypes.includes(userType as UserType)) {
             throw new Error('Access denied. You do not have the required permissions.');
        }
    }

    return { userId, userType: userType as UserType };
};


class ApiService {
    private db;
    private channel: BroadcastChannel;

    constructor() {
        this.db = firebaseDb;
        this.channel = new BroadcastChannel('notifyedu_attendance');
        this.seedIfNeeded();
    }
    
    private async seedIfNeeded() {
        const rootRef = ref(this.db);
        const rootSnapshot = await get(rootRef);
        const dbData = rootSnapshot.val() || {};
        const seedData = dbSeed();
        const updates: { [key: string]: any } = {};
        let needsUpdate = false;

        // --- Handle non-array essential nodes ---
        const singleNodes: (keyof DB)[] = ['contactInfo', 'footerInfo', 'locationQrValue'];
        singleNodes.forEach(nodeKey => {
            if (!dbData[nodeKey]) {
                console.log(`Essential node "${nodeKey}" is missing. Seeding it.`);
                updates[`/${nodeKey}`] = seedData[nodeKey];
                needsUpdate = true;
            }
        });

        // --- Handle array-based nodes (SuperAdmins, Schools) ---
        // This ensures individual records are added if they are missing, without overwriting the entire node.
        
        // SuperAdmins
        const seedAdmins = seedData.superAdmins;
        const existingAdmins = dbData.superAdmins || {};
        seedAdmins.forEach(admin => {
            if (!existingAdmins[admin.id]) {
                console.log(`Admin user "${admin.id}" is missing. Seeding it.`);
                updates[`/superAdmins/${admin.id}`] = admin;
                needsUpdate = true;
            }
        });

        // Schools (for the default school)
        const seedSchools = seedData.schools;
        const existingSchools = dbData.schools || {};
        seedSchools.forEach(school => {
            if (!existingSchools[school.id]) {
                console.log(`Seed school "${school.id}" is missing. Seeding it.`);
                updates[`/schools/${school.id}`] = school;
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            console.log("Applying missing essential seed data to Firebase...");
            await update(rootRef, updates);
            console.log("Seeding complete.");
        }
    }
    
    private snapshotToArray<T>(snapshot: any): T[] {
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.values(data) as T[];
    }

    // --- Auth Methods ---
    async loginSchool(id: string, pass: string): Promise<School> {
        const snapshot = await get(ref(this.db, `schools/${id}`));
        if(!snapshot.exists()) {
            throw new Error("अमान्य स्कूल आईडी। कृपया जांचें और पुनः प्रयास करें।");
        }
        const schoolData = snapshot.val();
        if(schoolData.password !== pass) {
            throw new Error("प्रदत्त स्कूल आईडी के लिए अमान्य पासवर्ड।");
        }

        const { password, ...schoolToReturn } = schoolData;
        schoolToReturn.token = generateToken(schoolToReturn.id, schoolToReturn.type);
        return schoolToReturn;
    }

    async loginStudent(id: string, pass: string): Promise<Student> {
        const snapshot = await get(ref(this.db, `students/${id}`));
        if(!snapshot.exists()) {
            throw new Error("अमान्य छात्र आईडी। कृपया जांचें और पुनः प्रयास करें।");
        }
        const studentData = snapshot.val();
        if(studentData.password_auto !== pass) {
            throw new Error("प्रदत्त छात्र आईडी के लिए अमान्य पासवर्ड।");
        }
        
        const { password_auto, ...studentToReturn } = studentData;
        studentToReturn.token = generateToken(studentToReturn.id, studentToReturn.type);
        return studentToReturn;
    }

    async loginGuard(id: string, pass: string): Promise<Guard> {
        const snapshot = await get(ref(this.db, `guards/${id}`));
        if(!snapshot.exists()) {
            throw new Error("अमान्य गार्ड आईडी। कृपया जांचें और पुनः प्रयास करें।");
        }
        const guardData = snapshot.val();
        if(guardData.password_auto !== pass) {
            throw new Error("प्रदत्त गार्ड आईडी के लिए अमान्य पासवर्ड।");
        }

        const { password_auto, ...guardToReturn } = guardData;
        guardToReturn.token = generateToken(guardToReturn.id, guardToReturn.type);
        return guardToReturn;
    }

    async loginBus(id: string, pass: string): Promise<Bus> {
        const snapshot = await get(ref(this.db, `buses/${id}`));
        if(!snapshot.exists()) {
            throw new Error("Invalid Bus ID. Please check and try again.");
        }
        const busData = snapshot.val();
        if(busData.password_auto !== pass) {
            throw new Error("Invalid password for the given Bus ID.");
        }
    
        const { password_auto, ...busToReturn } = busData;
        busToReturn.token = generateToken(busToReturn.id, busToReturn.type);
        return busToReturn;
    }

    // FIX: Add missing loginAcademicWork method
    async loginAcademicWork(id: string, pass: string): Promise<AcademicWork> {
        const snapshot = await get(ref(this.db, `academicWorks/${id}`));
        if(!snapshot.exists()) {
            throw new Error("Invalid Academic Staff ID. Please check and try again.");
        }
        const academicWorkData = snapshot.val();
        if(academicWorkData.password_auto !== pass) {
            throw new Error("Invalid password for the given Academic Staff ID.");
        }
    
        const { password_auto, ...academicWorkToReturn } = academicWorkData;
        academicWorkToReturn.token = generateToken(academicWorkToReturn.id, academicWorkToReturn.type);
        return academicWorkToReturn;
    }

    async loginSuperAdmin(id: string, pass: string): Promise<User> {
        const snapshot = await get(ref(this.db, `superAdmins/${id}`));
        if(!snapshot.exists()) {
            throw new Error("अमान्य एडमिन आईडी। कृपया जांचें और पुनः प्रयास करें।");
        }
        const adminData = snapshot.val();
        if(adminData.password !== pass) {
            throw new Error("प्रदत्त एडमिन आईडी के लिए अमान्य पासवर्ड।");
        }

        const userToReturn: User = {
            id: adminData.id,
            name: adminData.name,
            token: generateToken(adminData.id, adminData.type),
            type: adminData.type,
        };
        return userToReturn;
    }

    // --- School Methods ---
    async getSchoolStudents(schoolId: string, token: string): Promise<Student[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const snapshot = await get(ref(this.db, 'students'));
        const allStudents = this.snapshotToArray<Student>(snapshot);
        return allStudents.filter(student => student.school_id === schoolId);
    }
    
    async addStudent(schoolId: string, token: string, details: Partial<Student>): Promise<Student> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const newStudent: Student = {
            ...details,
            id: details.student_id!,
            school_id: schoolId,
            token: '',
            type: UserType.Student,
            qr_value: JSON.stringify({ student_id: details.student_id, school_id: schoolId }),
            fees_paid: 0,
            total_fees: 0
        } as Student;
        await set(ref(this.db, `students/${newStudent.id}`), newStudent);
        return newStudent;
    }

    async deleteStudent(schoolId: string, token: string, studentId: string): Promise<void> {
        validateToken(token, UserType.School);
        await remove(ref(this.db, `students/${studentId}`));
        // Also delete related logs
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(studentId));
        const snapshot = await get(q);
        if (snapshot.exists()) {
            const updates: { [key: string]: null } = {};
            snapshot.forEach(childSnapshot => {
                updates[`/attendanceLogs/${childSnapshot.key}`] = null;
            });
            await update(ref(this.db), updates);
        }
        return;
    }
    
    private notifyParent(log: AttendanceLog) {
        if (log.entity_type !== 'student') return;
        this.channel.postMessage({
            type: 'ATTENDANCE_UPDATE',
            studentId: log.entity_id,
            log: log
        });
    }

    async markAttendance(schoolId: string, token: string, entityId: string, status: AttendanceStatus, mode: AttendanceMode = AttendanceMode.MANUAL, entityType: 'student' | 'teacher' = 'student'): Promise<AttendanceLog> {
        const { userType } = validateToken(token, [UserType.School, UserType.AcademicWork]);
        
        // Prevent AcademicWork users from marking teacher attendance
        if (userType === UserType.AcademicWork && entityType === 'teacher') {
            throw new Error("You do not have permission to mark teacher attendance.");
        }

        const entitySnapshot = await get(ref(this.db, `${entityType}s/${entityId}`));
        if (!entitySnapshot.exists() || entitySnapshot.val().school_id !== schoolId) {
            throw new Error(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found in this school.`);
        }
        const entity = entitySnapshot.val();
    
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(entityId));
        const snapshot = await get(q);
        
        // Sort logs by time to determine the sequence of events
        const todayUTCStr = new Date().toISOString().split('T')[0];
        const todaysLogs = this.snapshotToArray<AttendanceLog>(snapshot)
            .filter(l => l.timestamp.startsWith(todayUTCStr))
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
        const firstLog = todaysLogs[0];
        const lastLog = todaysLogs[todaysLogs.length - 1];
    
        // Determine if this is a bus day or a walk-in day based on the first action
        let isBusDay;
        if (firstLog) {
            isBusDay = firstLog.status === AttendanceStatus.BUS_IN;
        } else {
            // If no logs yet, the current action determines the path for the day
            isBusDay = status === AttendanceStatus.BUS_IN;
        }
    
        if (!lastLog) {
            // No logs today, this is the first entry.
            // It can be BUS_IN or IN. OUTs are not allowed.
            if (status === AttendanceStatus.OUT || status === AttendanceStatus.BUS_OUT) {
                throw new Error(`Cannot mark ${status} as the first action of the day.`);
            }
        } else {
            // Logs exist, validate the sequence based on the day type.
            const lastStatus = lastLog.status;
            
            // If the new status is the same as the last recorded status, it's a redundant scan.
            // This prevents errors from accidental double-scans.
            if (status === lastStatus) {
                if (status === AttendanceStatus.IN || status === AttendanceStatus.BUS_IN) {
                    console.warn(`Redundant scan for ${entity.name}. Current status is already ${status}.`);
                    return lastLog; // Gracefully return the last log without erroring.
                }
            }
    
            if (isBusDay) {
                // BUS DAY PATH: BUS_IN -> IN -> OUT -> BUS_OUT
                const expectedNextStatus: Partial<Record<AttendanceStatus, AttendanceStatus>> = {
                    [AttendanceStatus.BUS_IN]: AttendanceStatus.IN,
                    [AttendanceStatus.IN]: AttendanceStatus.OUT,
                    [AttendanceStatus.OUT]: AttendanceStatus.BUS_OUT,
                };
    
                if (status !== expectedNextStatus[lastStatus]) {
                    if (lastStatus === AttendanceStatus.BUS_OUT) throw new Error(`${entity.name} has already completed the bus attendance cycle for today.`);
                    const expected = expectedNextStatus[lastStatus];
                    throw new Error(`Invalid sequence for bus user. After ${lastStatus}, expected ${expected || 'nothing'} but got ${status}.`);
                }
            } else { // It's a Walk-in Day
                // WALK-IN DAY PATH: IN -> OUT
                if (status === AttendanceStatus.BUS_IN || status === AttendanceStatus.BUS_OUT) {
                    throw new Error(`Cannot perform bus action. ${entity.name} did not check in with the bus this morning.`);
                }
    
                const expectedNextStatus: Partial<Record<AttendanceStatus, AttendanceStatus>> = {
                    [AttendanceStatus.IN]: AttendanceStatus.OUT,
                };
    
                if (status !== expectedNextStatus[lastStatus]) {
                    if (lastStatus === AttendanceStatus.OUT) throw new Error(`${entity.name} has already completed the attendance cycle for today.`);
                    const expected = expectedNextStatus[lastStatus];
                    throw new Error(`Invalid sequence. After ${lastStatus}, expected ${expected || 'nothing'} but got ${status}.`);
                }
            }
        }
    
        const newLogRef = push(ref(this.db, 'attendanceLogs'));
        const newLog: AttendanceLog = {
            log_id: newLogRef.key!,
            entity_id: entityId,
            entity_name: entity.name,
            entity_type: entityType,
            timestamp: new Date().toISOString(),
            status,
            mode,
            school_id: schoolId
        };
        await set(newLogRef, newLog);
        
        if (entityType === 'student') {
            this.notifyParent(newLog);
        }
        return newLog;
    }
    
    async markAttendanceByQr(schoolId: string, token: string, qrValue: string): Promise<{log: AttendanceLog, entityName: string}> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        
        let entityId, school_id, entityType: 'student' | 'teacher';

        try {
            const parsed = JSON.parse(qrValue);
            if (parsed.student_id) { entityId = parsed.student_id; entityType = 'student'; } 
            else if (parsed.teacher_id) { entityId = parsed.teacher_id; entityType = 'teacher'; } 
            else { throw new Error("Invalid QR code content."); }
            school_id = parsed.school_id;
        } catch (e) { throw new Error("Invalid QR code format."); }

        if(school_id !== schoolId) throw new Error("This QR code is not for your school.");

        const entitySnapshot = await get(ref(this.db, `${entityType}s/${entityId}`));
        if (!entitySnapshot.exists()) throw new Error(`${entityType} not found from QR code.`);
        const entityName = entitySnapshot.val().name;
        
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(entityId));
        const snapshot = await get(q);
        const todayUTCStr = new Date().toISOString().split('T')[0];
        const todaysLogs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => l.timestamp.startsWith(todayUTCStr));
        const lastLog = todaysLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        let newStatus: AttendanceStatus;
        if (!lastLog) {
            newStatus = AttendanceStatus.IN;
        } else {
            switch (lastLog.status) {
                case AttendanceStatus.BUS_IN:
                    newStatus = AttendanceStatus.IN;
                    break;
                case AttendanceStatus.IN:
                    newStatus = AttendanceStatus.OUT;
                    break;
                case AttendanceStatus.OUT:
                case AttendanceStatus.BUS_OUT:
                    throw new Error(`${entityName} has already left for the day.`);
                default: // e.g., ABSENT
                    newStatus = AttendanceStatus.IN;
            }
        }

        const log = await this.markAttendance(schoolId, token, entityId, newStatus, AttendanceMode.QR, entityType);
        return { log, entityName };
    }

    async getTodaysAttendance(schoolId: string, token: string): Promise<AttendanceLog[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const todayUTCStr = new Date().toISOString().split('T')[0];

        const snapshot = await get(ref(this.db, 'attendanceLogs'));
        const logs = this.snapshotToArray<AttendanceLog>(snapshot);
        const todaysLogs = logs.filter(l => l.school_id === schoolId && l.timestamp.startsWith(todayUTCStr));

        return todaysLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    async getStudentAttendanceHistory(studentId: string, token: string): Promise<AttendanceLog[]> {
        validateToken(token);
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(studentId));
        const snapshot = await get(q);
        const logs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => l.entity_type === 'student');
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async getAttendanceForDate(schoolId: string, token: string, date: string): Promise<AttendanceLog[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const dateStr = new Date(date).toDateString();
        
        const snapshot = await get(ref(this.db, 'attendanceLogs'));
        const logs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => l.school_id === schoolId && new Date(l.timestamp).toDateString() === dateStr && l.entity_type === 'student');

        return logs;
    }
    
    async getMonthlyAttendanceLogs(schoolId: string, token: string): Promise<AttendanceLog[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const snapshot = await get(ref(this.db, 'attendanceLogs'));
        const logs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => l.school_id === schoolId && new Date(l.timestamp) >= firstDayOfMonth);
        
        return logs;
    }

    async markAllAbsent(schoolId: string, token: string): Promise<number> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const todaysLogs = await this.getTodaysAttendance(schoolId, token);
        const presentStudentIds = new Set(todaysLogs.filter(l => l.status === AttendanceStatus.IN || l.status === AttendanceStatus.OUT).map(l => l.entity_id));
        
        const allStudents = await this.getSchoolStudents(schoolId, token);
        const studentsToMark = allStudents.filter(s => !presentStudentIds.has(s.student_id));
        
        const updates: { [key: string]: any } = {};
        studentsToMark.forEach(s => {
            const newLogRef = push(ref(this.db, 'attendanceLogs'));
            const newLog: AttendanceLog = {
                log_id: newLogRef.key!,
                entity_id: s.student_id,
                entity_name: s.name,
                entity_type: 'student',
                timestamp: new Date().toISOString(),
                status: AttendanceStatus.ABSENT,
                mode: AttendanceMode.SYSTEM,
                school_id: schoolId
            };
            updates[`/attendanceLogs/${newLog.log_id}`] = newLog;
            this.notifyParent(newLog);
        });

        await update(ref(this.db), updates);
        return studentsToMark.length;
    }
    
    async updateStudentFees(token: string, studentId: string, totalFees: number, feesPaid: number): Promise<Student> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const studentRef = ref(this.db, `students/${studentId}`);
        await update(studentRef, { total_fees: totalFees, fees_paid: feesPaid });
        const snapshot = await get(studentRef);
        return snapshot.val();
    }
    
    async getPaymentProofs(schoolId: string, token: string): Promise<PaymentProof[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const snapshot = await get(ref(this.db, 'paymentProofs'));
        const allProofs = this.snapshotToArray<PaymentProof>(snapshot);
        const proofs = allProofs.filter(proof => proof.school_id === schoolId);
        return proofs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async approvePaymentProof(token: string, proofId: string): Promise<PaymentProof> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const proofRef = ref(this.db, `paymentProofs/${proofId}`);
        const snapshot = await get(proofRef);
        if(!snapshot.exists()) throw new Error("Payment proof not found.");

        const proof = snapshot.val();
        if (proof.status !== PaymentProofStatus.PENDING) throw new Error("This proof has already been processed.");
        
        await update(proofRef, { status: PaymentProofStatus.APPROVED });
        proof.status = PaymentProofStatus.APPROVED;

        const studentRef = ref(this.db, `students/${proof.student_id}`);
        const studentSnapshot = await get(studentRef);
        if (studentSnapshot.exists()) {
            const student = studentSnapshot.val();
            await update(studentRef, { fees_paid: (student.fees_paid || 0) + proof.amount });
        }

        return proof;
    }

    async rejectPaymentProof(token: string, proofId: string): Promise<PaymentProof> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const proofRef = ref(this.db, `paymentProofs/${proofId}`);
        const snapshot = await get(proofRef);
        if(!snapshot.exists()) throw new Error("Payment proof not found.");
        
        const proof = snapshot.val();
        if (proof.status !== PaymentProofStatus.PENDING) throw new Error("This proof has already been processed.");
        
        await update(proofRef, { status: PaymentProofStatus.REJECTED });
        proof.status = PaymentProofStatus.REJECTED;

        return proof;
    }

    async getComplaints(schoolId: string, token: string): Promise<Complaint[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const studentIds = (await this.getSchoolStudents(schoolId, token)).map(s => s.student_id);
        const studentIdSet = new Set(studentIds);

        const snapshot = await get(ref(this.db, 'complaints'));
        const allComplaints = this.snapshotToArray<Complaint>(snapshot);
        const complaints = allComplaints.filter(c => studentIdSet.has(c.student_id));

        return complaints.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async resolveComplaint(schoolId: string, token: string, complaintId: string): Promise<Complaint> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const complaintRef = ref(this.db, `complaints/${complaintId}`);
        await update(complaintRef, { status: ComplaintStatus.RESOLVED });
        const snapshot = await get(complaintRef);
        return snapshot.val();
    }

    async createAnnouncement(schoolId: string, token: string, title: string, content: string): Promise<Announcement> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const newRef = push(ref(this.db, 'announcements'));
        const newAnnouncement: Announcement = {
            announcement_id: newRef.key!,
            school_id: schoolId,
            title,
            content,
            timestamp: new Date().toISOString()
        };
        await set(newRef, newAnnouncement);
        return newAnnouncement;
    }

    async deleteAnnouncement(token: string, announcementId: string): Promise<void> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        await remove(ref(this.db, `announcements/${announcementId}`));
        return;
    }
    
    async getAnnouncementsForSchool(schoolId: string, token: string): Promise<Announcement[]> {
        validateToken(token);
        const snapshot = await get(ref(this.db, 'announcements'));
        const allAnnouncements = this.snapshotToArray<Announcement>(snapshot);
        const announcements = allAnnouncements.filter(ann => ann.school_id === schoolId);
        return announcements.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    async sendMessageToParent(schoolId: string, token: string, studentId: string, text: string): Promise<Message> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const newRef = push(ref(this.db, 'messages'));
        const newMessage: Message = {
            message_id: newRef.key!,
            student_id: studentId,
            text,
            timestamp: new Date().toISOString(),
        };
        await set(newRef, newMessage);
        return newMessage;
    }
    
    async updateSchoolProfile(schoolId: string, token: string, data: Partial<School>): Promise<School> {
        validateToken(token, UserType.School);
        const schoolRef = ref(this.db, `schools/${schoolId}`);
        await update(schoolRef, data);
        const snapshot = await get(schoolRef);
        return snapshot.val();
    }

    async getSchoolById(schoolId: string, token: string): Promise<School> {
        validateToken(token);
        const snapshot = await get(ref(this.db, `schools/${schoolId}`));
        if (!snapshot.exists()) throw new Error("School not found.");
        return snapshot.val();
    }

    // --- Student Methods ---
    async getStudentById(studentId: string, token: string): Promise<Student> {
        validateToken(token, UserType.Student);
        const snapshot = await get(ref(this.db, `students/${studentId}`));
        if (!snapshot.exists()) throw new Error("Student not found.");

        const studentData = snapshot.val();
        const { password_auto, ...studentToReturn } = studentData;
        studentToReturn.token = token;
        return studentToReturn;
    }

    async getStudentAnalytics(studentId: string, token: string): Promise<StudentAnalytics> {
        validateToken(token, UserType.Student);
        const logs = await this.getStudentAttendanceHistory(studentId, token);
    
        const presentDays = new Set<string>();
        const absentDays = new Set<string>();
    
        logs.forEach(l => {
            const dateStr = new Date(l.timestamp).toDateString();
            const isPresentLog = [
                AttendanceStatus.IN,
                AttendanceStatus.OUT,
                AttendanceStatus.BUS_IN,
                AttendanceStatus.BUS_OUT,
            ].includes(l.status);
    
            if (isPresentLog) {
                presentDays.add(dateStr);
                absentDays.delete(dateStr); // A student cannot be both present and absent on the same day.
            } else if (l.status === AttendanceStatus.ABSENT) {
                // Only count as absent if no presence log exists for that day.
                if (!presentDays.has(dateStr)) {
                    absentDays.add(dateStr);
                }
            }
        });
        
        const todayStr = new Date().toDateString();
        const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === todayStr);
        const lastEntryLog = [...todayLogs].filter(l => l.status === AttendanceStatus.IN).pop();
        const lastExitLog = [...todayLogs].filter(l => l.status === AttendanceStatus.OUT).pop();

        return {
            present_count: presentDays.size,
            absent_count: absentDays.size,
            last_entry: lastEntryLog?.timestamp || null,
            last_exit: lastExitLog?.timestamp || null,
            recent_logs: logs.slice(0, 5)
        };
    }

    async getMessagesForStudent(studentId: string, token: string): Promise<Message[]> {
        validateToken(token, UserType.Student);
        const q = query(ref(this.db, 'messages'), orderByChild('student_id'), equalTo(studentId));
        const snapshot = await get(q);
        const messages = this.snapshotToArray<Message>(snapshot);
        return messages.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async submitComplaint(studentId: string, token: string, text: string): Promise<Complaint> {
        validateToken(token, UserType.Student);
        const studentSnapshot = await get(ref(this.db, `students/${studentId}`));
        if(!studentSnapshot.exists()) throw new Error("Student not found");
        const student = studentSnapshot.val();
        
        const newRef = push(ref(this.db, 'complaints'));
        const newComplaint: Complaint = {
            complaint_id: newRef.key!,
            student_id: studentId,
            student_name: student.name,
            text,
            timestamp: new Date().toISOString(),
            status: ComplaintStatus.OPEN,
            submitted_by_name: student.name,
            submitted_by_role: 'Student'
        };
        await set(newRef, newComplaint);
        return newComplaint;
    }
    
    async studentMarkAttendanceByQr(studentId: string, token: string, qrValue: string): Promise<AttendanceLog> {
        validateToken(token, UserType.Student);
        const studentSnapshot = await get(ref(this.db, `students/${studentId}`));
        if (!studentSnapshot.exists()) throw new Error("Student not found");
        const student = studentSnapshot.val();

        const locationQrSnapshot = await get(ref(this.db, 'locationQrValue'));
        let schoolQrMatch = qrValue === locationQrSnapshot.val();
        let personalQrMatch = false;
        try {
            const parsed = JSON.parse(qrValue);
            if (parsed.student_id === student.student_id) personalQrMatch = true;
        } catch(e) {}

        if (!schoolQrMatch && !personalQrMatch) throw new Error("Invalid QR code.");
        
        const schoolToken = generateToken(student.school_id, UserType.School);
        
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(studentId));
        const logSnapshot = await get(q);
        const todayUTCStr = new Date().toISOString().split('T')[0];
        const todaysLogs = this.snapshotToArray<AttendanceLog>(logSnapshot).filter(l => l.timestamp.startsWith(todayUTCStr));
        const lastLog = todaysLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        if (lastLog && lastLog.status === AttendanceStatus.OUT) throw new Error(`You have already been marked OUT for the day.`);
        
        const newStatus = (!lastLog || lastLog.status === AttendanceStatus.OUT) ? AttendanceStatus.IN : AttendanceStatus.OUT;

        return await this.markAttendance(student.school_id, schoolToken, studentId, newStatus, AttendanceMode.QR, 'student');
    }
    
    async getStudentAttendanceForDate(studentId: string, token: string, date: string): Promise<AttendanceLog[]> {
        validateToken(token, UserType.Student);
        const dateStr = new Date(date).toDateString();
        const logs = await this.getStudentAttendanceHistory(studentId, token);
        return logs.filter(l => new Date(l.timestamp).toDateString() === dateStr);
    }

    async submitPaymentProof(token: string, studentId: string, proofData: Omit<PaymentProof, 'proof_id' | 'school_id' | 'student_id' | 'student_name' | 'timestamp' | 'status'>): Promise<PaymentProof> {
        validateToken(token, UserType.Student);
        const studentSnapshot = await get(ref(this.db, `students/${studentId}`));
        if (!studentSnapshot.exists()) throw new Error("Student not found.");
        const student = studentSnapshot.val();

        const newRef = push(ref(this.db, 'paymentProofs'));
        const newProof: PaymentProof = {
            proof_id: newRef.key!,
            school_id: student.school_id,
            student_id: student.student_id,
            student_name: student.name,
            amount: proofData.amount,
            payer_name: proofData.payer_name,
            transaction_id: proofData.transaction_id,
            timestamp: new Date().toISOString(),
            status: PaymentProofStatus.PENDING,
        };

        await set(newRef, newProof);
        return newProof;
    }

    // --- Guard Methods ---
    async getSchoolGuards(schoolId: string, token: string): Promise<Guard[]> {
        validateToken(token, UserType.School);
        const snapshot = await get(ref(this.db, 'guards'));
        const allGuards = this.snapshotToArray<Guard>(snapshot);
        return allGuards.filter(guard => guard.school_id === schoolId);
    }

    async addGuard(schoolId: string, token: string, details: Partial<Guard>): Promise<Guard> {
        validateToken(token, UserType.School);
        const newGuard: Guard = {
            ...details,
            id: details.guard_id!,
            school_id: schoolId,
            token: '',
            type: UserType.Guard,
        } as Guard;
        await set(ref(this.db, `guards/${newGuard.id}`), newGuard);
        return newGuard;
    }
    
    async guardMarkAttendanceByQr(guardToken: string, qrValue: string): Promise<{log: AttendanceLog, entityName: string}> {
        const validation = validateToken(guardToken, UserType.Guard);
        const guardSnapshot = await get(ref(this.db, `guards/${validation?.userId}`));
        if (!guardSnapshot.exists()) throw new Error("Guard not found.");
        const guard = guardSnapshot.val();

        // This method can now reuse the main `markAttendanceByQr` logic
        const tempSchoolToken = generateToken(guard.school_id, UserType.School);
        return this.markAttendanceByQr(guard.school_id, tempSchoolToken, qrValue);
    }

    async guardSubmitComplaint(guardToken: string, studentIdentifier: string, text: string): Promise<Complaint> {
        const validation = validateToken(guardToken, UserType.Guard);
        const guardSnapshot = await get(ref(this.db, `guards/${validation?.userId}`));
        if (!guardSnapshot.exists()) throw new Error("Guard not found.");
        const guard = guardSnapshot.val();
        
        const studentsInSchool = await this.getSchoolStudents(guard.school_id, guardToken);
        const student = studentsInSchool.find(s => s.student_id === studentIdentifier || s.roll_no === studentIdentifier);
        if (!student) throw new Error(`Student with ID or Roll No. "${studentIdentifier}" not found.`);

        const newRef = push(ref(this.db, 'complaints'));
        const newComplaint: Complaint = {
            complaint_id: newRef.key!,
            student_id: student.student_id,
            student_name: student.name,
            text,
            timestamp: new Date().toISOString(),
            status: ComplaintStatus.OPEN,
            submitted_by_name: guard.name,
            submitted_by_role: 'Guard'
        };
        await set(newRef, newComplaint);
        return newComplaint;
    }

    // --- Bus Methods ---
    async getSchoolBuses(schoolId: string, token: string): Promise<Bus[]> {
        validateToken(token, UserType.School);
        const snapshot = await get(ref(this.db, 'buses'));
        const allBuses = this.snapshotToArray<Bus>(snapshot);
        return allBuses.filter(bus => bus.school_id === schoolId);
    }

    async addBus(schoolId: string, token: string, details: Partial<Bus>): Promise<Bus> {
        validateToken(token, UserType.School);
        const newBus: Bus = {
            ...details,
            id: details.bus_id!,
            school_id: schoolId,
            token: '',
            type: UserType.Bus,
        } as Bus;
        await set(ref(this.db, `buses/${newBus.id}`), newBus);
        return newBus;
    }

    async busMarkAttendanceByQr(busToken: string, qrValue: string): Promise<{log: AttendanceLog, entityName: string}> {
        const validation = validateToken(busToken, UserType.Bus);
        const busSnapshot = await get(ref(this.db, `buses/${validation?.userId}`));
        if (!busSnapshot.exists()) throw new Error("Bus staff not found.");
        const bus = busSnapshot.val();
    
        let studentId, school_id;
        try {
            const parsed = JSON.parse(qrValue);
            if (!parsed.student_id) { throw new Error("This QR code is not for a student."); }
            studentId = parsed.student_id;
            school_id = parsed.school_id;
        } catch (e) { throw new Error("Invalid QR code format."); }
    
        if(school_id !== bus.school_id) throw new Error("This student is not from your assigned school.");
    
        const studentSnapshot = await get(ref(this.db, `students/${studentId}`));
        if (!studentSnapshot.exists()) throw new Error(`Student not found from QR code.`);
        const studentName = studentSnapshot.val().name;
    
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(studentId));
        const snapshot = await get(q);
        const todayUTCStr = new Date().toISOString().split('T')[0];
        const todaysLogs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => l.timestamp.startsWith(todayUTCStr));
        const lastLog = todaysLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        let newStatus: AttendanceStatus;
    
        if (!lastLog) {
            // First event of the day
            newStatus = AttendanceStatus.BUS_IN;
        } else if (lastLog.status === AttendanceStatus.OUT) {
            // Left school, now getting on bus
            newStatus = AttendanceStatus.BUS_OUT;
        } else {
            // Any other state (already BUS_IN, IN school, already BUS_OUT) is an invalid time for a bus scan.
            throw new Error(`Invalid action. Last status for ${studentName} was ${lastLog.status}.`);
        }
    
        const tempSchoolToken = generateToken(bus.school_id, UserType.School);
        const log = await this.markAttendance(bus.school_id, tempSchoolToken, studentId, newStatus, AttendanceMode.QR, 'student');
        return { log, entityName: studentName };
    }

    // --- Teacher Methods ---
    async getSchoolTeachers(schoolId: string, token: string): Promise<Teacher[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const snapshot = await get(ref(this.db, 'teachers'));
        const allTeachers = this.snapshotToArray<Teacher>(snapshot);
        return allTeachers.filter(teacher => teacher.school_id === schoolId);
    }

    async addTeacher(schoolId: string, token: string, details: Partial<Teacher>): Promise<Teacher> {
        validateToken(token, UserType.School);
        const newTeacher: Teacher = {
            ...details,
            id: details.teacher_id!,
            school_id: schoolId,
            type: UserType.Teacher,
            qr_value: JSON.stringify({ teacher_id: details.teacher_id, school_id: schoolId }),
        } as Teacher;
        await set(ref(this.db, `teachers/${newTeacher.id}`), newTeacher);
        return newTeacher;
    }
    
    async getTeacherAttendanceHistory(teacherId: string, token: string): Promise<AttendanceLog[]> {
        validateToken(token, UserType.School);
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(teacherId));
        const snapshot = await get(q);
        const logs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => l.entity_type === 'teacher');
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async getTeacherMonthlyReport(teacherId: string): Promise<AttendanceLog[]> {
        const teacherSnapshot = await get(ref(this.db, `teachers/${teacherId}`));
        if (!teacherSnapshot.exists()) throw new Error("Teacher ID not found.");
        
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const q = query(ref(this.db, 'attendanceLogs'), orderByChild('entity_id'), equalTo(teacherId));
        const snapshot = await get(q);
        const logs = this.snapshotToArray<AttendanceLog>(snapshot).filter(l => new Date(l.timestamp) >= firstDayOfMonth && l.entity_type === 'teacher');
        
        return logs;
    }

    // FIX: Add missing Academic Work methods
    // --- Academic Work Methods ---
    async getSchoolAcademicWorks(schoolId: string, token: string): Promise<AcademicWork[]> {
        validateToken(token, UserType.School);
        const snapshot = await get(ref(this.db, 'academicWorks'));
        const allAcademicWorks = this.snapshotToArray<AcademicWork>(snapshot);
        return allAcademicWorks.filter(aw => aw.school_id === schoolId);
    }

    async addAcademicWork(schoolId: string, token: string, details: Partial<AcademicWork>): Promise<AcademicWork> {
        validateToken(token, UserType.School);
        const newAcademicWork: AcademicWork = {
            ...details,
            id: details.academic_work_id!,
            school_id: schoolId,
            token: '',
            type: UserType.AcademicWork,
        } as AcademicWork;
        await set(ref(this.db, `academicWorks/${newAcademicWork.id}`), newAcademicWork);
        return newAcademicWork;
    }

    // --- Class Routine Methods ---
    async getSchoolClassRoutine(schoolId: string, token: string, className: ClassName): Promise<ClassRoutineEntry[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const snapshot = await get(ref(this.db, 'classRoutines'));
        const allRoutines = this.snapshotToArray<ClassRoutineEntry>(snapshot);
        const routines = allRoutines.filter(r => r.school_id === schoolId && r.class_name === className);
        return routines.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    async getAllSchoolClassRoutines(schoolId: string, token: string): Promise<ClassRoutineEntry[]> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const snapshot = await get(ref(this.db, 'classRoutines'));
        const allRoutines = this.snapshotToArray<ClassRoutineEntry>(snapshot);
        return allRoutines.filter(r => r.school_id === schoolId);
    }

    async updateSchoolClassRoutine(schoolId: string, token: string, className: ClassName, routine: Partial<ClassRoutineEntry>[]): Promise<void> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);

        const snapshot = await get(ref(this.db, 'classRoutines'));
        const updates: { [key: string]: any } = {};

        // Remove old entries for this class
        this.snapshotToArray<ClassRoutineEntry>(snapshot).forEach(entry => {
            if(entry.class_name === className && entry.school_id === schoolId) {
                updates[`/classRoutines/${entry.id}`] = null;
            }
        });

        // Add new entries
        routine
            .filter(r => r.start_time && r.end_time && r.subject && r.teacher_id)
            .forEach(entry => {
                const newId = entry.id || push(ref(this.db, 'classRoutines')).key!;
                const newEntry: ClassRoutineEntry = {
                    id: newId,
                    school_id: schoolId,
                    class_name: className,
                    start_time: entry.start_time!,
                    end_time: entry.end_time!,
                    subject: entry.subject!,
                    teacher_id: entry.teacher_id!,
                };
                updates[`/classRoutines/${newId}`] = newEntry;
            });
        
        await update(ref(this.db), updates);
        return;
    }

    async getStudentClassRoutine(studentId: string, token: string): Promise<{ routine: ClassRoutineEntry[], teachers: Teacher[] }> {
        validateToken(token, UserType.Student);
        const studentSnapshot = await get(ref(this.db, `students/${studentId}`));
        if (!studentSnapshot.exists()) throw new Error("Student not found.");
        const student = studentSnapshot.val();

        // Fetch routine for the student's class
        const routineSnapshot = await get(ref(this.db, 'classRoutines'));
        const allRoutines = this.snapshotToArray<ClassRoutineEntry>(routineSnapshot);
        const routine = allRoutines
            .filter(r => r.school_id === student.school_id && r.class_name === (student.class as ClassName))
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

        // Fetch all teachers for the school
        const teachersSnapshot = await get(ref(this.db, 'teachers'));
        const allTeachers = this.snapshotToArray<Teacher>(teachersSnapshot);
        const teachers = allTeachers.filter(t => t.school_id === student.school_id);

        return { routine, teachers };
    }

    // FIX: Add missing methods for exam results management.
    // --- Exam Result Methods ---
    async createExamSession(token: string, schoolId: string, name: string): Promise<ExamSession> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        const newRef = push(ref(this.db, 'examSessions'));
        const newSession: ExamSession = {
            id: newRef.key!,
            schoolId: schoolId,
            name: name,
            timestamp: new Date().toISOString(),
        };
        await set(newRef, newSession);
        return newSession;
    }

    async getExamSessions(token: string, schoolId: string): Promise<ExamSession[]> {
        validateToken(token);
        const snapshot = await get(ref(this.db, 'examSessions'));
        const allSessions = this.snapshotToArray<ExamSession>(snapshot);
        const schoolSessions = allSessions.filter(s => s.schoolId === schoolId);
        return schoolSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async saveStudentResult(token: string, schoolId: string, result: StudentResult): Promise<StudentResult> {
        validateToken(token, [UserType.School, UserType.AcademicWork]);
        if (result.schoolId !== schoolId) {
            throw new Error("Result does not belong to this school.");
        }
        await set(ref(this.db, `studentResults/${result.id}`), result);
        return result;
    }

    async getResultsForClass(token: string, schoolId: string, sessionId: string, className: ClassName): Promise<StudentResult[]> {
        validateToken(token);
        const snapshot = await get(ref(this.db, 'studentResults'));
        const allResults = this.snapshotToArray<StudentResult>(snapshot);
        return allResults.filter(r =>
            r.schoolId === schoolId &&
            r.sessionId === sessionId &&
            r.className === className
        );
    }

    // --- Admin Methods ---
    async getAllSchools(token: string): Promise<School[]> {
        validateToken(token, UserType.SuperAdmin);
        const schoolsSnapshot = await get(ref(this.db, 'schools'));
        const studentsSnapshot = await get(ref(this.db, 'students'));
        const schools = this.snapshotToArray<School>(schoolsSnapshot);
        const students = this.snapshotToArray<Student>(studentsSnapshot);
        
        const schoolsWithCount = schools.map(s => ({
            ...s,
            student_count: students.filter(st => st.school_id === s.id).length
        }));
        return schoolsWithCount;
    }

    async adminGetStudentsForSchool(token: string, schoolId: string): Promise<Student[]> {
        validateToken(token, UserType.SuperAdmin);
        const snapshot = await get(ref(this.db, 'students'));
        const allStudents = this.snapshotToArray<Student>(snapshot);
        return allStudents.filter(student => student.school_id === schoolId);
    }

    async createSchool(token: string, details: Partial<School>): Promise<School> {
        validateToken(token, UserType.SuperAdmin);
        const newSchool: School = {
            id: details.name!.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 4),
            name: details.name!,
            token: '',
            type: UserType.School,
            address: details.address!,
            contact_no: details.contact_no!,
            status: 'ACTIVE',
            subscription_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            password: details.password,
        };
        await set(ref(this.db, `schools/${newSchool.id}`), newSchool);
        return newSchool;
    }

    async updateSchool(token: string, schoolId: string, data: Partial<School>): Promise<School> {
        validateToken(token, UserType.SuperAdmin);
        const schoolRef = ref(this.db, `schools/${schoolId}`);
        await update(schoolRef, data);
        const snapshot = await get(schoolRef);
        return snapshot.val();
    }

    // --- Agent Methods ---
    async getAgents(token: string): Promise<Agent[]> {
        validateToken(token, UserType.SuperAdmin);
        const snapshot = await get(ref(this.db, 'agents'));
        return this.snapshotToArray<Agent>(snapshot);
    }

    async getAgentById(agentId: string): Promise<Agent> {
        const snapshot = await get(ref(this.db, `agents/${agentId}`));
        if (!snapshot.exists()) throw new Error("Agent not found.");
        return snapshot.val();
    }

    async addAgent(token: string, details: Omit<Agent, 'id' | 'qrValue'>): Promise<Agent> {
        validateToken(token, UserType.SuperAdmin);
        const newRef = push(ref(this.db, 'agents'));
        const agentId = newRef.key!;
    
        // Construct the URL from its core parts to avoid issues with existing hashes or query params.
        const { protocol, host, pathname } = window.location;
        const agentQrUrl = `${protocol}//${host}${pathname}#/agent/${agentId}`;
    
        const newAgent: Agent = {
            id: agentId,
            name: details.name,
            content: details.content,
            photoBase64: details.photoBase64,
            qrValue: agentQrUrl,
        };
        await set(newRef, newAgent);
        return newAgent;
    }

    async updateAgent(token: string, agentId: string, details: Partial<Omit<Agent, 'id' | 'qrValue'>>): Promise<Agent> {
        validateToken(token, UserType.SuperAdmin);
        const agentRef = ref(this.db, `agents/${agentId}`);
        await update(agentRef, details);
        const snapshot = await get(agentRef);
        return snapshot.val();
    }

    async deleteAgent(token: string, agentId: string): Promise<void> {
        validateToken(token, UserType.SuperAdmin);
        await remove(ref(this.db, `agents/${agentId}`));
    }
    
    // --- Public/CMS Methods ---
    async getContactInfo(): Promise<ContactInfo> {
        const snapshot = await get(ref(this.db, 'contactInfo'));
        return snapshot.val();
    }
    
    async updateContactInfo(token: string, data: ContactInfo): Promise<ContactInfo> {
        validateToken(token, UserType.SuperAdmin);
        await set(ref(this.db, 'contactInfo'), data);
        return data;
    }

    async getFooterInfo(): Promise<FooterInfo> {
        const snapshot = await get(ref(this.db, 'footerInfo'));
        return snapshot.val();
    }

    async updateFooterInfo(token: string, data: FooterInfo): Promise<FooterInfo> {
        validateToken(token, UserType.SuperAdmin);
        await set(ref(this.db, 'footerInfo'), data);
        return data;
    }
}

export const api = new ApiService();