import { XMLParser } from "fast-xml-parser";
import StudentVue, { Client } from "../index";
import {
	AdditionalInfo,
	AdditionalInfoItem,
	ClassInfo,
	ClassScheduleInfo,
	EmergencyContact,
	Schedule,
	SchoolInfo,
	SchoolScheduleInfo,
	StaffInfo,
	StudentInfo,
	TermInfo,
} from "../StudentVue/Client/Client.interfaces";
import RequestException from "../StudentVue/RequestException/RequestException";
import { SchoolDistrict } from "../StudentVue/StudentVue.interfaces";
import readable from "../utils/readable";
import "jest-extended";
import { expectTypeOf } from "expect-type";
import Message from "../StudentVue/Message/Message";
jest.setTimeout(60000);

/**
 * Add your user credentials from credentials.json
 * The JSON must be formatted like this:
 * {
 *  "username": "myUsername",
 *  "password": "myPassword",
 *  "district": "https://student.tusd1.org/"
 * }
 */
import credentials from "./credentials.json";
import { Calendar } from "../StudentVue/Client/Interfaces/Calendar";
import { addMonths, isThisMonth, sub } from "date-fns";
import ResourceType from "../Constants/ResourceType";
import {
	Assignment,
	FileResource,
	Gradebook,
	Resource,
	URLResource,
} from "../StudentVue/Client/Interfaces/Gradebook";
import {
	Absence,
	AbsentPeriod,
	Attendance,
	PeriodInfo,
} from "../StudentVue/Client/Interfaces/Attendance";
import { ReportCard } from "..";
import { ReportCardFile } from "../StudentVue/ReportCard";
import Document from "../StudentVue/Document/Document";
import _ from "lodash";

jest
	.spyOn(StudentVue, "login")
	.mockImplementation((districtUrl, credentials) => {
		const host = new URL(districtUrl).host;

		const endpoint: string = `https://${host}/Service/PXPCommunication.asmx`;
		const client = new Client(
			{
				username: credentials.username,
				password: credentials.password,
				districtUrl: endpoint,
			},
			`https://${host}/`
		);
		return Promise.resolve(client);
	});

let client: Client;
let messages: Message[];
let calendar: Calendar;
let gradebook: Gradebook;
let attendance: Attendance;
let reportCards: ReportCard[];
let documents: Document[];
let schoolInfo: SchoolInfo;
let resources: (URLResource | FileResource)[];
let studentInfo: StudentInfo;

beforeAll(async () => {
	const session = await StudentVue.login(credentials.district, {
		username: credentials.username,
		password: credentials.password,
	});
	const [
		session_1,
		_messages,
		_calendar,
		_gradebook,
		_attendance,
		_reportCards,
		_documents,
		_schoolInfo,
		_studentInfo,
	] = await Promise.all([
		session,
		session.messages(),
		session.calendar(),
		session.gradebook(),
		session.attendance(),
		session.reportCards(),
		session.documents(),
		session.schoolInfo(),
		session.studentInfo(),
	]);
	studentInfo = _studentInfo;
	calendar = _calendar;
	client = session_1;
	gradebook = _gradebook;
	messages = _messages;
	attendance = _attendance;
	reportCards = _reportCards;
	documents = _documents;
	schoolInfo = _schoolInfo;
	resources = gradebook.courses
		.map((course) =>
			course.marks.map((mark) =>
				mark.assignments.map((assignment) => assignment.resources)
			)
		)
		.flat(4);
	client = session_1;
});

describe("StudentInfo", () => {
	it("properties match type", () => {
		expect(studentInfo).toStrictEqual<StudentInfo>({
			// additionalInfo: expect.arrayContaining<AdditionalInfo>([
			//   {
			//     id: expect.any(String),
			//     items: expect.arrayContaining<AdditionalInfoItem>([
			//       {
			//         source: { element: expect.any(String), object: expect.any(String) },
			//         type: expect.any(String),
			//         value: expect.any(String),
			//         vcId: expect.any(String),
			//       },
			//     ]),
			//     type: expect.any(String),
			//     vcId: expect.any(String),
			//   },
			// ]),
			address: expect.any(String),
			birthDate: expect.any(Date),
			counselor: {
				email: expect.any(String),
				name: expect.any(String),
				staffGu: expect.any(String),
			},
			currentSchool: expect.any(String),
			dentist: {
				extn: expect.any(String),
				name: expect.any(String),
				office: expect.any(String),
				phone: expect.any(String),
			},
			email: expect.any(String),
			// emergencyContacts: expect.arrayContaining<EmergencyContact>([
			//   {
			//     name: expect.any(String),
			//     relationship: expect.any(String),
			//     phone: {
			//       home: expect.any(String),
			//       mobile: expect.any(String),
			//       other: expect.any(String),
			//       work: expect.any(String),
			//     },
			//   },
			// ]),
			gender: expect.any(String),
			grade: expect.any(String),
			homeLanguage: expect.any(String),
			homeRoom: expect.any(String),
			homeRoomTeacher: {
				email: expect.any(String),
				name: expect.any(String),
				staffGu: expect.any(String),
			},
			id: expect.any(String),
			lockerInfoRecords: expect.any(String),
			orgYearGu: expect.any(String),
			phone: expect.any(String),
			photo: expect.any(String),
			physician: {
				name: expect.any(String),
				hospital: expect.any(String),
				extn: expect.any(String),
				phone: expect.any(String),
			},
			student: {
				lastName: expect.any(String),
				name: expect.any(String),
				nickname: expect.any(String),
			},
			track: expect.any(String),
		});
	});
	it("Is defined", async () => {
		expect(studentInfo).toBeDefined();
	});
});

describe("User Messages", () => {
	it("Fetches a list of messages", () => {
		expect(messages).toBeDefined();
	});

	// it("Messages are an instance of Message class", async () => {
	// 	const randomMessage = messages[Math.floor(Math.random() * messages.length)];

	// 	expect(randomMessage).toBeInstanceOf(Message);
	// });

	it("Message is marked as read", async () => {
		const unreadMessages = messages.filter((msg) => !msg.isRead());
		const unreadMessage = unreadMessages[0];
		if (unreadMessage == null)
			return console.warn(
				"No unread messages found on account. Skipping test..."
			);
		const beforeMarkAsRead = unreadMessage.isRead();

		await unreadMessage.markAsRead();

		// fetch from server again to make sure it is marked as read
		const newMessages = await client.messages();
		const updated = newMessages.find((msg) => msg.id === unreadMessage.id);
		expect(updated!.isRead()).toBe(true);
		expect(unreadMessage.isRead()).toBe(true);
		expect(beforeMarkAsRead).toBe(false);
	});

	it("Message attachment has base64 string", async () => {
		const withAttachment = messages.filter((msg) => msg.attachments.length > 0);
		if (withAttachment.length === 0)
			return console.warn("No messages with an attachment. Skipping test...");
		const attachment = withAttachment[0].attachments[0];

		expect(attachment.fileExtension).toBeTruthy();

		const base64 = await attachment.get();

		expect(base64).toMatch(
			/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
		); // validates base64
	});
});

describe("Calendar events", () => {
	it("is defined", async () => {
		expect(calendar).toBeDefined();
	});

	it("fetch all events within school year", async () => {
		expect.assertions(1);
		const wholeSchoolYear = await client.calendar({
			concurrency: null,
		});
		expect(wholeSchoolYear).toBeDefined();
	});
	it("events are not in base64", () => {
		for (const event of calendar.events) {
			expect(event.title).toBe(decodeURI(event.title));
		}
	});
	it("output range is throughout the school year", () => {
		expect(calendar.outputRange.start === calendar.outputRange.end).toBeFalsy();
	});
});

describe("Gradebook", () => {
	it("has matching properties", () => {
		expectTypeOf(gradebook).toMatchTypeOf<Gradebook>();
	});

	it("fetches gradebook with reportPeriod of 0", async () => {
		const gradebook_0 = await client.gradebook(0);
		expect(gradebook_0.reportingPeriod.current.name).toBe("MP1 Interim");
	});

	it("resources have a valid URI", () => {
		if (resources.length === 0)
			return console.warn("Resources has a length of 0. Skipping...");
		expect(resources).toStrictEqual(
			expect.arrayContaining([
				expect.objectContaining({
					file: expect.objectContaining({ uri: expect.any(String) }),
				}),
			])
		);
	});

	it("URL resources have a URL", () => {
		if (
			resources.some((rsrc) => rsrc.type !== ResourceType.URL) ||
			resources.length === 0
		)
			return console.warn("No URL resources found. Skipping...");
		expect(resources).toStrictEqual(
			expect.arrayContaining([
				expect.objectContaining<Partial<URLResource>>({
					url: expect.any(String),
				}),
			])
		);
	});

	it("encoded properly", () => {
		const assignments = gradebook.courses.flatMap((csrc) =>
			csrc.marks.flatMap((mark) => mark.assignments)
		);
		if (assignments.length > 0)
			expect(assignments).toStrictEqual(
				expect.arrayContaining([
					expect.objectContaining<Partial<Assignment>>({
						type: expect.any(String),
						description: expect.any(String),
						name: expect.any(String),
						hasDropbox: expect.any(Boolean),
					}),
				])
			);
		else expect(assignments).toBeArray();
	});
});

describe("Attendance", () => {
	it("properties match type", () => {
		expect(attendance).toStrictEqual<Attendance>({
			absences: expect.toBeOneOf([
				expect.toBeArrayOfSize(0),
				expect.arrayContaining<Absence>([
					{
						date: expect.any(Date),
						description: expect.any(String),
						note: expect.any(String),
						periods: expect.arrayContaining<AbsentPeriod>([
							{
								course: expect.any(String),
								name: expect.any(String),
								orgYearGu: expect.any(String),
								period: expect.any(Number),
								reason: expect.any(String),
								staff: {
									email: expect.any(String),
									name: expect.any(String),
									staffGu: expect.any(String),
								},
							},
						]),
						reason: expect.any(String),
					},
				]),
			]) as any,
			period: {
				total: expect.any(Number),
				start: expect.any(Number),
				end: expect.any(Number),
			},
			periodInfos: expect.arrayContaining<PeriodInfo>([
				{
					period: expect.any(Number),
					total: {
						activities: expect.any(Number),
						excused: expect.any(Number),
						tardies: expect.any(Number),
						unexcused: expect.any(Number),
						unexcusedTardies: expect.any(Number),
					},
				},
			]),
			schoolName: expect.any(String),
			type: expect.any(String),
		});
	});
	it("is defined", async () => {
		expect(attendance).toBeDefined();
	});
	it("periods are numbers", async () => {
		expect(attendance.periodInfos).toStrictEqual(
			expect.arrayContaining([
				expect.objectContaining<Partial<PeriodInfo>>({
					period: expect.any(Number),
				}),
			])
		);
	});
});

describe("Schedule", () => {
	it("matches type", async () => {
		const schedule = await client.schedule();
		expectTypeOf(schedule).toMatchTypeOf<Schedule>();
		if (schedule.today.length === 0)
			return expect(schedule).toStrictEqual<Schedule>({
				error: expect.any(String),
				term: { index: expect.any(Number), name: expect.any(String) },
				classes:
					schedule.classes.length > 0
						? expect.arrayContaining<ClassInfo>([
								{
									name: expect.any(String),
									period: expect.any(Number),
									room: expect.any(String),
									sectionGu: expect.any(String),
									teacher: {
										email: expect.any(String),
										name: expect.any(String),
										staffGu: expect.any(String),
									},
								},
						  ])
						: expect.toBeArray(),
				terms: expect.arrayContaining<TermInfo>([
					{
						date: { start: expect.any(Date), end: expect.any(Date) },
						index: expect.any(Number),
						name: expect.any(String),
						schoolYearTermCodeGu: expect.any(String),
					},
				]),
				today: expect.any(Array),
			});
		expect(schedule).toMatchObject<Omit<Schedule, "today">>({
			error: expect.any(String),
			term: { index: expect.any(Number), name: expect.any(String) },
			classes:
				schedule.classes.length > 0
					? expect.arrayContaining<ClassInfo>([
							{
								name: expect.any(String),
								period: expect.any(Number),
								room: expect.any(String),
								sectionGu: expect.any(String),
								teacher: {
									email: expect.any(String),
									name: expect.any(String),
									staffGu: expect.any(String),
								},
							},
					  ])
					: expect.toBeArray(),
			terms: expect.arrayContaining<TermInfo>([
				{
					date: { start: expect.any(Date), end: expect.any(Date) },
					index: expect.any(Number),
					name: expect.any(String),
					schoolYearTermCodeGu: expect.any(String),
				},
			]),
			// today:
			// expect.arrayContaining<SchoolScheduleInfo>([
			//   {
			//     bellScheduleName: expect.any(String),
			//     name: expect.any(String),
			//     classes: expect.arrayContaining<ClassScheduleInfo>([
			//       {
			//         attendanceCode: expect.any(String),
			//         date: { start: expect.any(Date), end: expect.any(Date) },
			//         name: expect.any(String),
			//         period: expect.any(Number),
			//         sectionGu: expect.any(String),
			//         teacher: {
			//           email: expect.any(String),
			//           name: expect.any(String),
			//           emailSubject: expect.any(String),
			//           staffGu: expect.any(String),
			//           url: expect.any(String),
			//         },
			//         time: { start: expect.any(Date), end: expect.any(Date) },
			//         url: expect.any(String),
			//       },
			//     ]),
			//   },
			// ]),
		});
		schedule.today.forEach((d) => {
			if (d.classes.length > 0)
				d.classes.forEach((cl) => {
					expect(cl).toStrictEqual({
						attendanceCode: expect.any(String),
						date: { start: expect.any(Date), end: expect.any(Date) },
						name: expect.any(String),
						period: expect.any(Number),
						sectionGu: expect.any(String),
						teacher: {
							email: expect.any(String),
							name: expect.any(String),
							emailSubject: expect.any(String),
							staffGu: expect.any(String),
							url: expect.any(String),
						},
						time: { start: expect.any(Date), end: expect.any(Date) },
						url: expect.any(String),
					});
				});
		});
	});
});

describe("School Info", () => {
	it("matches type", async () => {
		const schoolInfo = await client.schoolInfo();
		expectTypeOf(schoolInfo).toMatchTypeOf<SchoolInfo>();
	});
	it("has properties of type", () => {
		expect(schoolInfo).toStrictEqual<SchoolInfo>({
			school: {
				address: expect.any(String),
				addressAlt: expect.any(String),
				altPhone: expect.any(String),
				city: expect.any(String),
				phone: expect.any(String),
				principal: {
					email: expect.any(String),
					name: expect.any(String),
					staffGu: expect.any(String),
				},
				zipCode: expect.any(String),
			},
			staff: expect.arrayContaining<StaffInfo>([
				{
					email: expect.any(String),
					extn: expect.any(String),
					jobTitle: expect.any(String),
					name: expect.any(String),
					phone: expect.any(String),
					staffGu: expect.any(String),
				},
			]),
		});
	});
});

describe("Report Card", () => {
	it("matches type", () => {
		expectTypeOf(reportCards).toMatchTypeOf<ReportCard[]>();
	});
	it("gets a base64", async () => {
		const index = Math.floor(Math.random() * reportCards.length);
		const reportCard = reportCards[index];
		expectTypeOf(reportCard).toMatchTypeOf<ReportCard>();
		const file = await reportCard.get();
		if (file) {
			expect(file.base64).toMatch(
				/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
			);
			expectTypeOf(file).toMatchTypeOf<ReportCardFile>();
		}
	});
});

describe("Documents", () => {
	it("matches type", () => {
		expectTypeOf(documents).toMatchTypeOf<Document[]>();
	});

	it("document is a base64", async () => {
		const document = await documents[0].get();

		expect(document[0].base64).toMatch(
			/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
		);
	});
});

describe("School info", () => {
	it("matches type", () => {
		expectTypeOf(schoolInfo).toMatchTypeOf<SchoolInfo>();
	});
});

describe("credential validations", () => {
	it("works", async () => {
		const client = await StudentVue.login(credentials.district, {
			username: credentials.username,
			password: credentials.password,
		});
		try {
			await client.validateCredentials();
		} catch (e) {
			console.error(e);
		}
	});

	it("throws on invalid user credentials", async () => {
		const client = await StudentVue.login(credentials.district, {
			username: credentials.username,
			password: "491293389",
		});
		try {
			await client.validateCredentials();
		} catch (e) {
			expect(e).toBeInstanceOf(RequestException);
		}
	});
});
