(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "../../utils/soap/soap", "../Message/Message", "date-fns", "../../Constants/EventType", "lodash", "../../Constants/ResourceType", "../ReportCard/ReportCard", "../Document/Document", "../../utils/XMLFactory/XMLFactory", "../../utils/cache/cache", "./Client.helpers"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("../../utils/soap/soap"), require("../Message/Message"), require("date-fns"), require("../../Constants/EventType"), require("lodash"), require("../../Constants/ResourceType"), require("../ReportCard/ReportCard"), require("../Document/Document"), require("../../utils/XMLFactory/XMLFactory"), require("../../utils/cache/cache"), require("./Client.helpers"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.soap, global.Message, global.dateFns, global.EventType, global.lodash, global.ResourceType, global.ReportCard, global.Document, global.XMLFactory, global.cache, global.Client);
    global.Client = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _soap, _Message, _dateFns, _EventType, _lodash, _ResourceType, _ReportCard, _Document, _XMLFactory, _cache, _Client) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _soap = _interopRequireDefault(_soap);
  _Message = _interopRequireDefault(_Message);
  _EventType = _interopRequireDefault(_EventType);
  _lodash = _interopRequireDefault(_lodash);
  _ResourceType = _interopRequireDefault(_ResourceType);
  _ReportCard = _interopRequireDefault(_ReportCard);
  _Document = _interopRequireDefault(_Document);
  _XMLFactory = _interopRequireDefault(_XMLFactory);
  _cache = _interopRequireDefault(_cache);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * The StudentVUE Client to access the API
   * @constructor
   * @extends {soap.Client}
   */
  class Client extends _soap.default.Client {
    constructor(credentials, hostUrl) {
      super(credentials);
      this.hostUrl = hostUrl;
    }

    /**
     * Validate's the user's credentials. It will throw an error if credentials are incorrect
     */
    validateCredentials() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'login test',
          validateErrors: false
        }).then(response => {
          res();
          //if (response.RT_ERROR[0]['@_ERROR_MESSAGE'][0] === 'login test is not a valid method.' || response.RT_ERROR[0]['@_ERROR_MESSAGE'][0].includes("A critical error has occurred.")) res();
          //else rej(new RequestException(response));
        }).catch(rej);
      });
    }

    /**
     * Gets the student's documents from synergy servers
     * @returns {Promise<Document[]>}> Returns a list of student documents
     * @description
     * ```js
     * const documents = await client.documents();
     * const document = documents[0];
     * const files = await document.get();
     * const base64collection = files.map((file) => file.base64);
     * ```
     */
    documents() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'GetStudentDocumentInitialData',
          paramStr: {
            childIntId: 0
          }
        }).then(xmlObject => {
          var _a = xmlObject['StudentDocuments'][0].StudentDocumentDatas[0].StudentDocumentData;
          var _f = xml => {
            return new _Document.default(xml, super.credentials);
          };
          var _r = [];
          for (var _i = 0; _i < _a.length; _i++) {
            _r.push(_f(_a[_i], _i, _a));
          }
          res(_r);
        }).catch(rej);
      });
    }

    /**
     * Gets a list of report cards
     * @returns {Promise<ReportCard[]>} Returns a list of report cards that can fetch a file
     * @description
     * ```js
     * const reportCards = await client.reportCards();
     * const files = await Promise.all(reportCards.map((card) => card.get()));
     * const base64arr = files.map((file) => file.base64); // ["JVBERi0...", "dUIoa1...", ...];
     * ```
     */
    reportCards() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'GetReportCardInitialData',
          paramStr: {
            childIntId: 0
          }
        }).then(xmlObject => {
          var _a2 = xmlObject.RCReportingPeriodData[0].RCReportingPeriods[0].RCReportingPeriod;
          var _f2 = xml => {
            return new _ReportCard.default(xml, super.credentials);
          };
          var _r2 = [];
          for (var _i2 = 0; _i2 < _a2.length; _i2++) {
            _r2.push(_f2(_a2[_i2], _i2, _a2));
          }
          res(_r2);
        }).catch(rej);
      });
    }

    /**
     * Gets the student's school's information
     * @returns {Promise<SchoolInfo>} Returns the information of the student's school
     * @description
     * ```js
     * await client.schoolInfo();
     *
     * client.schoolInfo().then((schoolInfo) => {
     *  console.log(_.uniq(schoolInfo.staff.map((staff) => staff.name))); // List all staff positions using lodash
     * })
     * ```
     */
    schoolInfo() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'StudentSchoolInfo',
          paramStr: {
            childIntID: 0
          }
        }).then(({
          StudentSchoolInfoListing: [xmlObject]
        }) => {
          var _a3 = xmlObject.StaffLists[0].StaffList;
          var _f3 = staff => {
            return {
              name: staff['@_Name'][0],
              email: staff['@_EMail'][0],
              staffGu: staff['@_StaffGU'][0],
              jobTitle: staff['@_Title'][0],
              extn: staff['@_Extn'][0],
              phone: staff['@_Phone'][0]
            };
          };
          var _r3 = [];
          for (var _i3 = 0; _i3 < _a3.length; _i3++) {
            _r3.push(_f3(_a3[_i3], _i3, _a3));
          }
          res({
            school: {
              address: xmlObject['@_SchoolAddress'][0],
              addressAlt: xmlObject['@_SchoolAddress2'][0],
              city: xmlObject['@_SchoolCity'][0],
              zipCode: xmlObject['@_SchoolZip'][0],
              phone: xmlObject['@_Phone'][0],
              altPhone: xmlObject['@_Phone2'][0],
              principal: {
                name: xmlObject['@_Principal'][0],
                email: xmlObject['@_PrincipalEmail'][0],
                staffGu: xmlObject['@_PrincipalGu'][0]
              }
            },
            staff: _r3
          });
        }).catch(rej);
      });
    }

    /**
     * Gets the schedule of the student
     * @param {number} termIndex The index of the term.
     * @returns {Promise<Schedule>} Returns the schedule of the student
     * @description
     * ```js
     * await schedule(0) // -> { term: { index: 0, name: '1st Qtr Progress' }, ... }
     * ```
     */
    schedule(termIndex) {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'StudentClassList',
          paramStr: {
            childIntId: 0,
            ...(termIndex != null ? {
              TermIndex: termIndex
            } : {})
          }
        }).then(xmlObject => {
          var _a4 = xmlObject.StudentClassSchedule[0].TermLists[0].TermListing;
          var _f4 = term => {
            return {
              date: {
                start: new Date(term['@_BeginDate'][0]),
                end: new Date(term['@_EndDate'][0])
              },
              index: Number(term['@_TermIndex'][0]),
              name: term['@_TermName'][0],
              schoolYearTermCodeGu: term['@_SchoolYearTrmCodeGU'][0]
            };
          };
          var _r4 = [];
          for (var _i4 = 0; _i4 < _a4.length; _i4++) {
            _r4.push(_f4(_a4[_i4], _i4, _a4));
          }
          res({
            term: {
              index: Number(xmlObject.StudentClassSchedule[0]['@_TermIndex'][0]),
              name: xmlObject.StudentClassSchedule[0]['@_TermIndexName'][0]
            },
            error: xmlObject.StudentClassSchedule[0]['@_ErrorMessage'][0],
            today: typeof xmlObject.StudentClassSchedule[0].TodayScheduleInfoData[0].SchoolInfos[0] !== 'string' ? xmlObject.StudentClassSchedule[0].TodayScheduleInfoData[0].SchoolInfos[0].SchoolInfo.map(school => {
              return {
                name: school['@_SchoolName'][0],
                bellScheduleName: school['@_BellSchedName'][0],
                classes: typeof school.Classes[0] !== 'string' ? school.Classes[0].ClassInfo.map(course => {
                  return {
                    period: Number(course['@_Period'][0]),
                    attendanceCode: course.AttendanceCode[0],
                    date: {
                      start: new Date(course['@_StartDate'][0]),
                      end: new Date(course['@_EndDate'][0])
                    },
                    name: course['@_ClassName'][0],
                    sectionGu: course['@_SectionGU'][0],
                    teacher: {
                      email: course['@_TeacherEmail'][0],
                      emailSubject: course['@_EmailSubject'][0],
                      name: course['@_TeacherName'][0],
                      staffGu: course['@_StaffGU'][0],
                      url: course['@_TeacherURL'][0]
                    },
                    url: course['@_ClassURL'][0],
                    time: {
                      start: (0, _dateFns.parse)(course['@_StartTime'][0], 'hh:mm a', Date.now()),
                      end: (0, _dateFns.parse)(course['@_EndTime'][0], 'hh:mm a', Date.now())
                    }
                  };
                }) : []
              };
            }) : [],
            classes: typeof xmlObject.StudentClassSchedule[0].ClassLists[0] !== 'string' ? xmlObject.StudentClassSchedule[0].ClassLists[0].ClassListing.map(studentClass => {
              return {
                name: studentClass['@_CourseTitle'][0],
                period: Number(studentClass['@_Period'][0]),
                room: studentClass['@_RoomName'][0],
                sectionGu: studentClass['@_SectionGU'][0],
                teacher: {
                  name: studentClass['@_Teacher'][0],
                  email: studentClass['@_TeacherEmail'][0],
                  staffGu: studentClass['@_TeacherStaffGU'][0]
                }
              };
            }) : [],
            terms: _r4
          });
        }).catch(rej);
      });
    }

    /**
     * Returns the attendance of the student
     * @returns {Promise<Attendance>} Returns an Attendance object
     * @description
     * ```js
     * client.attendance()
     *  .then(console.log); // -> { type: 'Period', period: {...}, schoolName: 'University High School', absences: [...], periodInfos: [...] }
     * ```
     */
    attendance() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'Attendance',
          paramStr: {
            childIntId: 0
          }
        }).then(attendanceXMLObject => {
          const xmlObject = attendanceXMLObject.Attendance[0];
          var _a5 = xmlObject.TotalActivities[0].PeriodTotal;
          var _f5 = (pd, i) => {
            return {
              period: Number(pd['@_Number'][0]),
              total: {
                excused: Number(xmlObject.TotalExcused[0].PeriodTotal[i]['@_Total'][0]),
                tardies: Number(xmlObject.TotalTardies[0].PeriodTotal[i]['@_Total'][0]),
                unexcused: Number(xmlObject.TotalUnexcused[0].PeriodTotal[i]['@_Total'][0]),
                activities: Number(xmlObject.TotalActivities[0].PeriodTotal[i]['@_Total'][0]),
                unexcusedTardies: Number(xmlObject.TotalUnexcusedTardies[0].PeriodTotal[i]['@_Total'][0])
              }
            };
          };
          var _r5 = [];
          for (var _i5 = 0; _i5 < _a5.length; _i5++) {
            _r5.push(_f5(_a5[_i5], _i5, _a5));
          }
          res({
            type: xmlObject['@_Type'][0],
            period: {
              total: Number(xmlObject['@_PeriodCount'][0]),
              start: Number(xmlObject['@_StartPeriod'][0]),
              end: Number(xmlObject['@_EndPeriod'][0])
            },
            schoolName: xmlObject['@_SchoolName'][0],
            absences: xmlObject.Absences[0].Absence ? xmlObject.Absences[0].Absence.map(absence => {
              return {
                date: new Date(absence['@_AbsenceDate'][0]),
                reason: absence['@_Reason'][0],
                note: absence['@_Note'][0],
                description: absence['@_CodeAllDayDescription'][0],
                periods: absence.Periods[0].Period.map(period => {
                  return {
                    period: Number(period['@_Number'][0]),
                    name: period['@_Name'][0],
                    reason: period['@_Reason'][0],
                    course: period['@_Course'][0],
                    staff: {
                      name: period['@_Staff'][0],
                      staffGu: period['@_StaffGU'][0],
                      email: period['@_StaffEMail'][0]
                    },
                    orgYearGu: period['@_OrgYearGU'][0]
                  };
                })
              };
            }) : [],
            periodInfos: _r5
          });
        }).catch(rej);
      });
    }

    /**
     * Returns the gradebook of the student
     * @param {number} reportingPeriodIndex The timeframe that the gradebook should return
     * @returns {Promise<Gradebook>} Returns a Gradebook object
     * @description
     * ```js
     * const gradebook = await client.gradebook();
     * console.log(gradebook); // { error: '', type: 'Traditional', reportingPeriod: {...}, courses: [...] };
     *
     * await client.gradebook(0) // Some schools will have ReportingPeriodIndex 0 as "1st Quarter Progress"
     * await client.gradebook(7) // Some schools will have ReportingPeriodIndex 7 as "4th Quarter"
     * ```
     */
    gradebook(reportingPeriodIndex) {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'Gradebook',
          paramStr: {
            childIntId: 0,
            ...(reportingPeriodIndex != null ? {
              ReportPeriod: reportingPeriodIndex
            } : {})
          }
        }, xml => {
          return new _XMLFactory.default(xml).encodeAttribute('MeasureDescription', 'HasDropBox').encodeAttribute('Measure', 'Type').toString();
        }).then(xmlObject => {
          var _a6 = xmlObject.Gradebook[0].ReportingPeriods[0].ReportPeriod;
          var _f6 = period => {
            return {
              date: {
                start: new Date(period['@_StartDate'][0]),
                end: new Date(period['@_EndDate'][0])
              },
              name: period['@_GradePeriod'][0],
              index: Number(period['@_Index'][0])
            };
          };
          var _r6 = [];
          for (var _i6 = 0; _i6 < _a6.length; _i6++) {
            _r6.push(_f6(_a6[_i6], _i6, _a6));
          }
          var _a7 = xmlObject.Gradebook[0].Courses[0].Course;
          var _f7 = course => {
            var _a8 = course.Marks[0].Mark;
            var _f8 = mark => {
              return {
                name: mark['@_MarkName'][0],
                calculatedScore: {
                  string: mark['@_CalculatedScoreString'][0],
                  raw: Number(mark['@_CalculatedScoreRaw'][0])
                },
                weightedCategories: typeof mark['GradeCalculationSummary'][0] !== 'string' ? mark['GradeCalculationSummary'][0].AssignmentGradeCalc.map(weighted => {
                  return {
                    type: weighted['@_Type'][0],
                    calculatedMark: weighted['@_CalculatedMark'][0],
                    weight: {
                      evaluated: weighted['@_WeightedPct'][0],
                      standard: weighted['@_Weight'][0]
                    },
                    points: {
                      current: Number(weighted['@_Points'][0]),
                      possible: Number(weighted['@_PointsPossible'][0])
                    }
                  };
                }) : [],
                assignments: typeof mark.Assignments[0] !== 'string' ? mark.Assignments[0].Assignment.map(assignment => {
                  return {
                    gradebookId: assignment['@_GradebookID'][0],
                    name: decodeURI(assignment['@_Measure'][0]),
                    type: assignment['@_Type'][0],
                    date: {
                      start: new Date(assignment['@_Date'][0]),
                      due: new Date(assignment['@_DueDate'][0])
                    },
                    score: {
                      type: assignment['@_ScoreType'][0],
                      value: assignment['@_Score'][0]
                    },
                    points: assignment['@_Points'][0],
                    notes: assignment['@_Notes'][0],
                    teacherId: assignment['@_TeacherID'][0],
                    description: decodeURI(assignment['@_MeasureDescription'][0]),
                    hasDropbox: JSON.parse(assignment['@_HasDropBox'][0]),
                    studentId: assignment['@_StudentID'][0],
                    dropboxDate: {
                      start: new Date(assignment['@_DropStartDate'][0]),
                      end: new Date(assignment['@_DropEndDate'][0])
                    },
                    resources: typeof assignment.Resources[0] !== 'string' ? assignment.Resources[0].Resource.map(rsrc => {
                      switch (rsrc['@_Type'][0]) {
                        case 'File':
                          {
                            const fileRsrc = rsrc;
                            return {
                              type: _ResourceType.default.FILE,
                              file: {
                                type: fileRsrc['@_FileType'][0],
                                name: fileRsrc['@_FileName'][0],
                                uri: this.hostUrl + fileRsrc['@_ServerFileName'][0]
                              },
                              resource: {
                                date: new Date(fileRsrc['@_ResourceDate'][0]),
                                id: fileRsrc['@_ResourceID'][0],
                                name: fileRsrc['@_ResourceName'][0]
                              }
                            };
                          }
                        case 'URL':
                          {
                            const urlRsrc = rsrc;
                            return {
                              url: urlRsrc['@_URL'][0],
                              type: _ResourceType.default.URL,
                              resource: {
                                date: new Date(urlRsrc['@_ResourceDate'][0]),
                                id: urlRsrc['@_ResourceID'][0],
                                name: urlRsrc['@_ResourceName'][0],
                                description: urlRsrc['@_ResourceDescription'][0]
                              },
                              path: urlRsrc['@_ServerFileName'][0]
                            };
                          }
                        default:
                          rej(`Type ${rsrc['@_Type'][0]} does not exist as a type. Add it to type declarations.`);
                      }
                    }) : []
                  };
                }) : []
              };
            };
            var _r8 = [];
            for (var _i8 = 0; _i8 < _a8.length; _i8++) {
              _r8.push(_f8(_a8[_i8], _i8, _a8));
            }
            return {
              period: Number(course['@_Period'][0]),
              title: course['@_Title'][0],
              room: course['@_Room'][0],
              staff: {
                name: course['@_Staff'][0],
                email: course['@_StaffEMail'][0],
                staffGu: course['@_StaffGU'][0]
              },
              marks: _r8
            };
          };
          var _r7 = [];
          for (var _i7 = 0; _i7 < _a7.length; _i7++) {
            _r7.push(_f7(_a7[_i7], _i7, _a7));
          }
          res({
            error: xmlObject.Gradebook[0]['@_ErrorMessage'][0],
            type: xmlObject.Gradebook[0]['@_Type'][0],
            reportingPeriod: {
              current: {
                index: reportingPeriodIndex ?? Number(xmlObject.Gradebook[0].ReportingPeriods[0].ReportPeriod.find(x => {
                  return x['@_GradePeriod'][0] === xmlObject.Gradebook[0].ReportingPeriod[0]['@_GradePeriod'][0];
                })?.['@_Index'][0]),
                date: {
                  start: new Date(xmlObject.Gradebook[0].ReportingPeriod[0]['@_StartDate'][0]),
                  end: new Date(xmlObject.Gradebook[0].ReportingPeriod[0]['@_EndDate'][0])
                },
                name: xmlObject.Gradebook[0].ReportingPeriod[0]['@_GradePeriod'][0]
              },
              available: _r6
            },
            courses: _r7
          });
        }).catch(rej);
      });
    }

    /**
     * Get a list of messages of the student
     * @returns {Promise<Message[]>} Returns an array of messages of the student
     * @description
     * ```js
     * await client.messages(); // -> [{ id: 'E972F1BC-99A0-4CD0-8D15-B18968B43E08', type: 'StudentActivity', ... }, { id: '86FDA11D-42C7-4249-B003-94B15EB2C8D4', type: 'StudentActivity', ... }]
     * ```
     */
    messages() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'GetPXPMessages',
          paramStr: {
            childIntId: 0
          }
        }, xml => {
          return new _XMLFactory.default(xml).encodeAttribute('Content', 'Read').toString();
        }).then(xmlObject => {
          res(xmlObject.PXPMessagesData[0].MessageListings[0].MessageListing ? xmlObject.PXPMessagesData[0].MessageListings[0].MessageListing.map(message => {
            return new _Message.default(message, super.credentials, this.hostUrl);
          }) : []);
        }).catch(rej);
      });
    }

    /**
     * Gets the info of a student
     * @returns {Promise<StudentInfo>} StudentInfo object
     * @description
     * ```js
     * studentInfo().then(console.log) // -> { student: { name: 'Evan Davis', nickname: '', lastName: 'Davis' }, ...}
     * ```
     */
    studentInfo() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'StudentInfo',
          paramStr: {
            childIntId: 0
          }
        }).then(async xmlObjectData => {
          await console.log(xmlObjectData);
          res({
            student: {
              name: xmlObjectData.StudentInfo[0].FormattedName[0],
              lastName: xmlObjectData.StudentInfo[0].LastNameGoesBy[0],
              nickname: xmlObjectData.StudentInfo[0].NickName[0]
            },
            birthDate: new Date(xmlObjectData.StudentInfo[0].BirthDate[0]),
            track: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Track),
            address: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Address),
            photo: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Photo),
            counselor: xmlObjectData.StudentInfo[0].CounselorName && xmlObjectData.StudentInfo[0].CounselorEmail && xmlObjectData.StudentInfo[0].CounselorStaffGU ? {
              name: xmlObjectData.StudentInfo[0].CounselorName[0],
              email: xmlObjectData.StudentInfo[0].CounselorEmail[0],
              staffGu: xmlObjectData.StudentInfo[0].CounselorStaffGU[0]
            } : undefined,
            currentSchool: xmlObjectData.StudentInfo[0].CurrentSchool[0],
            dentist: xmlObjectData.StudentInfo[0].Dentist ? {
              name: xmlObjectData.StudentInfo[0].Dentist[0]['@_Name'][0],
              phone: xmlObjectData.StudentInfo[0].Dentist[0]['@_Phone'][0],
              extn: xmlObjectData.StudentInfo[0].Dentist[0]['@_Extn'][0],
              office: xmlObjectData.StudentInfo[0].Dentist[0]['@_Office'][0]
            } : undefined,
            physician: xmlObjectData.StudentInfo[0].Physician ? {
              name: xmlObjectData.StudentInfo[0].Physician[0]['@_Name'][0],
              phone: xmlObjectData.StudentInfo[0].Physician[0]['@_Phone'][0],
              extn: xmlObjectData.StudentInfo[0].Physician[0]['@_Extn'][0],
              hospital: xmlObjectData.StudentInfo[0].Physician[0]['@_Hospital'][0]
            } : undefined,
            id: (0, _Client.optional)(xmlObjectData.StudentInfo[0].PermID),
            orgYearGu: (0, _Client.optional)(xmlObjectData.StudentInfo[0].OrgYearGU),
            phone: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Phone),
            email: (0, _Client.optional)(xmlObjectData.StudentInfo[0].EMail),
            // emergencyContacts: xmlObjectData.StudentInfo[0].EmergencyContacts && xmlObjectData.StudentInfo[0].EmergencyContacts[0]
            //   ? xmlObjectData.StudentInfo[0].EmergencyContacts[0].EmergencyContact.map((contact) => ({
            //       name: optional(contact['@_Name']),
            //       phone: {
            //         home: optional(contact['@_HomePhone']),
            //         mobile: optional(contact['@_MobilePhone']),
            //         other: optional(contact['@_OtherPhone']),
            //         work: optional(contact['@_WorkPhone']),
            //       },
            //       relationship: optional(contact['@_Relationship']),
            //     }))
            //   : [],
            gender: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Gender),
            grade: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Grade),
            lockerInfoRecords: (0, _Client.optional)(xmlObjectData.StudentInfo[0].LockerInfoRecords),
            homeLanguage: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeLanguage),
            homeRoom: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoom),
            homeRoomTeacher: {
              email: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoomTchEMail),
              name: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoomTch),
              staffGu: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoomTchStaffGU)
            }
            // additionalInfo: xmlObjectData.StudentInfo[0].UserDefinedGroupBoxes[0].UserDefinedGroupBox
            //   ? (xmlObjectData.StudentInfo[0].UserDefinedGroupBoxes[0].UserDefinedGroupBox.map((definedBox) => ({
            //       id: optional(definedBox['@_GroupBoxID']), // string | undefined
            //       type: definedBox['@_GroupBoxLabel'][0], // string
            //       vcId: optional(definedBox['@_VCID']), // string | undefined
            //       items: definedBox.UserDefinedItems[0].UserDefinedItem.map((item) => ({
            //         source: {
            //           element: item['@_SourceElement'][0],
            //           object: item['@_SourceObject'][0],
            //         },
            //         vcId: item['@_VCID'][0],
            //         value: item['@_Value'][0],
            //         type: item['@_ItemType'][0],
            //       })) as AdditionalInfoItem[],
            //     })) as AdditionalInfo[])
            //   : [],
          });
        }).catch(rej);
      });
    }
    fetchEventsWithinInterval(date) {
      return super.processRequest({
        methodName: 'StudentCalendar',
        paramStr: {
          childIntId: 0,
          RequestDate: date.toISOString()
        }
      }, xml => {
        return new _XMLFactory.default(xml).encodeAttribute('Title', 'Icon').toString();
      });
    }

    /**
     *
     * @param {CalendarOptions} options Options to provide for calendar method. An interval is required.
     * @returns {Promise<Calendar>} Returns a Calendar object
     * @description
     * ```js
     * client.calendar({ interval: { start: new Date('5/1/2022'), end: new Date('8/1/2021') }, concurrency: null }); // -> Limitless concurrency (not recommended)
     *
     * const calendar = await client.calendar({ interval: { ... }});
     * console.log(calendar); // -> { schoolDate: {...}, outputRange: {...}, events: [...] }
     * ```
     */
    async calendar(options = {}) {
      const defaultOptions = {
        concurrency: 7,
        ...options
      };
      const cal = await _cache.default.memo(() => {
        return this.fetchEventsWithinInterval(new Date());
      });
      const schoolEndDate = options.interval?.end ?? new Date(cal.CalendarListing[0]['@_SchoolEndDate'][0]);
      const schoolStartDate = options.interval?.start ?? new Date(cal.CalendarListing[0]['@_SchoolBegDate'][0]);
      return new Promise((res, rej) => {
        const monthsWithinSchoolYear = (0, _dateFns.eachMonthOfInterval)({
          start: schoolStartDate,
          end: schoolEndDate
        });
        const getAllEventsWithinSchoolYear = () => {
          return defaultOptions.concurrency == null ? Promise.all(monthsWithinSchoolYear.map(date => {
            return this.fetchEventsWithinInterval(date);
          })) : (0, _Client.asyncPoolAll)(defaultOptions.concurrency, monthsWithinSchoolYear, date => {
            return this.fetchEventsWithinInterval(date);
          });
        };
        let memo = null;
        getAllEventsWithinSchoolYear().then(events => {
          const allEvents = events.reduce((prev, events) => {
            if (memo == null) {
              memo = {
                schoolDate: {
                  start: new Date(events.CalendarListing[0]['@_SchoolBegDate'][0]),
                  end: new Date(events.CalendarListing[0]['@_SchoolEndDate'][0])
                },
                outputRange: {
                  start: schoolStartDate,
                  end: schoolEndDate
                },
                events: []
              };
            }
            const rest = {
              ...memo,
              // This is to prevent re-initializing Date objects in order to improve performance
              events: [...(prev.events ? prev.events : []), ...(typeof events.CalendarListing[0].EventLists[0] !== 'string' ? events.CalendarListing[0].EventLists[0].EventList.map(event => {
                switch (event['@_DayType'][0]) {
                  case _EventType.default.ASSIGNMENT:
                    {
                      const assignmentEvent = event;
                      return {
                        title: decodeURI(assignmentEvent['@_Title'][0]),
                        addLinkData: assignmentEvent['@_AddLinkData'][0],
                        agu: assignmentEvent['@_AGU'] ? assignmentEvent['@_AGU'][0] : undefined,
                        date: new Date(assignmentEvent['@_Date'][0]),
                        dgu: assignmentEvent['@_DGU'][0],
                        link: assignmentEvent['@_Link'][0],
                        startTime: assignmentEvent['@_StartTime'][0],
                        type: _EventType.default.ASSIGNMENT,
                        viewType: assignmentEvent['@_ViewType'][0]
                      };
                    }
                  case _EventType.default.HOLIDAY:
                    {
                      return {
                        title: decodeURI(event['@_Title'][0]),
                        type: _EventType.default.HOLIDAY,
                        startTime: event['@_StartTime'][0],
                        date: new Date(event['@_Date'][0])
                      };
                    }
                  case _EventType.default.REGULAR:
                    {
                      const regularEvent = event;
                      return {
                        title: decodeURI(regularEvent['@_Title'][0]),
                        agu: regularEvent['@_AGU'] ? regularEvent['@_AGU'][0] : undefined,
                        date: new Date(regularEvent['@_Date'][0]),
                        description: regularEvent['@_EvtDescription'] ? regularEvent['@_EvtDescription'][0] : undefined,
                        dgu: regularEvent['@_DGU'] ? regularEvent['@_DGU'][0] : undefined,
                        link: regularEvent['@_Link'] ? regularEvent['@_Link'][0] : undefined,
                        startTime: regularEvent['@_StartTime'][0],
                        type: _EventType.default.REGULAR,
                        viewType: regularEvent['@_ViewType'] ? regularEvent['@_ViewType'][0] : undefined,
                        addLinkData: regularEvent['@_AddLinkData'] ? regularEvent['@_AddLinkData'][0] : undefined
                      };
                    }
                }
              }) : [])]
            };
            return rest;
          }, {});
          res({
            ...allEvents,
            events: _lodash.default.uniqBy(allEvents.events, item => {
              return item.title;
            })
          });
        }).catch(rej);
      });
    }
  }
  _exports.default = Client;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDbGllbnQiLCJzb2FwIiwiY29uc3RydWN0b3IiLCJjcmVkZW50aWFscyIsImhvc3RVcmwiLCJ2YWxpZGF0ZUNyZWRlbnRpYWxzIiwiUHJvbWlzZSIsInJlcyIsInJlaiIsInByb2Nlc3NSZXF1ZXN0IiwibWV0aG9kTmFtZSIsInZhbGlkYXRlRXJyb3JzIiwidGhlbiIsInJlc3BvbnNlIiwiY2F0Y2giLCJkb2N1bWVudHMiLCJwYXJhbVN0ciIsImNoaWxkSW50SWQiLCJ4bWxPYmplY3QiLCJTdHVkZW50RG9jdW1lbnREYXRhcyIsIlN0dWRlbnREb2N1bWVudERhdGEiLCJ4bWwiLCJEb2N1bWVudCIsInJlcG9ydENhcmRzIiwiUkNSZXBvcnRpbmdQZXJpb2REYXRhIiwiUkNSZXBvcnRpbmdQZXJpb2RzIiwiUkNSZXBvcnRpbmdQZXJpb2QiLCJSZXBvcnRDYXJkIiwic2Nob29sSW5mbyIsImNoaWxkSW50SUQiLCJTdHVkZW50U2Nob29sSW5mb0xpc3RpbmciLCJTdGFmZkxpc3RzIiwiU3RhZmZMaXN0Iiwic3RhZmYiLCJuYW1lIiwiZW1haWwiLCJzdGFmZkd1Iiwiam9iVGl0bGUiLCJleHRuIiwicGhvbmUiLCJzY2hvb2wiLCJhZGRyZXNzIiwiYWRkcmVzc0FsdCIsImNpdHkiLCJ6aXBDb2RlIiwiYWx0UGhvbmUiLCJwcmluY2lwYWwiLCJzY2hlZHVsZSIsInRlcm1JbmRleCIsIlRlcm1JbmRleCIsIlN0dWRlbnRDbGFzc1NjaGVkdWxlIiwiVGVybUxpc3RzIiwiVGVybUxpc3RpbmciLCJ0ZXJtIiwiZGF0ZSIsInN0YXJ0IiwiRGF0ZSIsImVuZCIsImluZGV4IiwiTnVtYmVyIiwic2Nob29sWWVhclRlcm1Db2RlR3UiLCJlcnJvciIsInRvZGF5IiwiVG9kYXlTY2hlZHVsZUluZm9EYXRhIiwiU2Nob29sSW5mb3MiLCJTY2hvb2xJbmZvIiwibWFwIiwiYmVsbFNjaGVkdWxlTmFtZSIsImNsYXNzZXMiLCJDbGFzc2VzIiwiQ2xhc3NJbmZvIiwiY291cnNlIiwicGVyaW9kIiwiYXR0ZW5kYW5jZUNvZGUiLCJBdHRlbmRhbmNlQ29kZSIsInNlY3Rpb25HdSIsInRlYWNoZXIiLCJlbWFpbFN1YmplY3QiLCJ1cmwiLCJ0aW1lIiwicGFyc2UiLCJub3ciLCJDbGFzc0xpc3RzIiwiQ2xhc3NMaXN0aW5nIiwic3R1ZGVudENsYXNzIiwicm9vbSIsInRlcm1zIiwiYXR0ZW5kYW5jZSIsImF0dGVuZGFuY2VYTUxPYmplY3QiLCJBdHRlbmRhbmNlIiwiVG90YWxBY3Rpdml0aWVzIiwiUGVyaW9kVG90YWwiLCJwZCIsImkiLCJ0b3RhbCIsImV4Y3VzZWQiLCJUb3RhbEV4Y3VzZWQiLCJ0YXJkaWVzIiwiVG90YWxUYXJkaWVzIiwidW5leGN1c2VkIiwiVG90YWxVbmV4Y3VzZWQiLCJhY3Rpdml0aWVzIiwidW5leGN1c2VkVGFyZGllcyIsIlRvdGFsVW5leGN1c2VkVGFyZGllcyIsInR5cGUiLCJzY2hvb2xOYW1lIiwiYWJzZW5jZXMiLCJBYnNlbmNlcyIsIkFic2VuY2UiLCJhYnNlbmNlIiwicmVhc29uIiwibm90ZSIsImRlc2NyaXB0aW9uIiwicGVyaW9kcyIsIlBlcmlvZHMiLCJQZXJpb2QiLCJvcmdZZWFyR3UiLCJwZXJpb2RJbmZvcyIsImdyYWRlYm9vayIsInJlcG9ydGluZ1BlcmlvZEluZGV4IiwiUmVwb3J0UGVyaW9kIiwiWE1MRmFjdG9yeSIsImVuY29kZUF0dHJpYnV0ZSIsInRvU3RyaW5nIiwiR3JhZGVib29rIiwiUmVwb3J0aW5nUGVyaW9kcyIsIkNvdXJzZXMiLCJDb3Vyc2UiLCJNYXJrcyIsIk1hcmsiLCJtYXJrIiwiY2FsY3VsYXRlZFNjb3JlIiwic3RyaW5nIiwicmF3Iiwid2VpZ2h0ZWRDYXRlZ29yaWVzIiwiQXNzaWdubWVudEdyYWRlQ2FsYyIsIndlaWdodGVkIiwiY2FsY3VsYXRlZE1hcmsiLCJ3ZWlnaHQiLCJldmFsdWF0ZWQiLCJzdGFuZGFyZCIsInBvaW50cyIsImN1cnJlbnQiLCJwb3NzaWJsZSIsImFzc2lnbm1lbnRzIiwiQXNzaWdubWVudHMiLCJBc3NpZ25tZW50IiwiYXNzaWdubWVudCIsImdyYWRlYm9va0lkIiwiZGVjb2RlVVJJIiwiZHVlIiwic2NvcmUiLCJ2YWx1ZSIsIm5vdGVzIiwidGVhY2hlcklkIiwiaGFzRHJvcGJveCIsIkpTT04iLCJzdHVkZW50SWQiLCJkcm9wYm94RGF0ZSIsInJlc291cmNlcyIsIlJlc291cmNlcyIsIlJlc291cmNlIiwicnNyYyIsImZpbGVSc3JjIiwiUmVzb3VyY2VUeXBlIiwiRklMRSIsImZpbGUiLCJ1cmkiLCJyZXNvdXJjZSIsImlkIiwidXJsUnNyYyIsIlVSTCIsInBhdGgiLCJ0aXRsZSIsIm1hcmtzIiwicmVwb3J0aW5nUGVyaW9kIiwiZmluZCIsIngiLCJSZXBvcnRpbmdQZXJpb2QiLCJhdmFpbGFibGUiLCJjb3Vyc2VzIiwibWVzc2FnZXMiLCJQWFBNZXNzYWdlc0RhdGEiLCJNZXNzYWdlTGlzdGluZ3MiLCJNZXNzYWdlTGlzdGluZyIsIm1lc3NhZ2UiLCJNZXNzYWdlIiwic3R1ZGVudEluZm8iLCJ4bWxPYmplY3REYXRhIiwiY29uc29sZSIsImxvZyIsInN0dWRlbnQiLCJTdHVkZW50SW5mbyIsIkZvcm1hdHRlZE5hbWUiLCJsYXN0TmFtZSIsIkxhc3ROYW1lR29lc0J5Iiwibmlja25hbWUiLCJOaWNrTmFtZSIsImJpcnRoRGF0ZSIsIkJpcnRoRGF0ZSIsInRyYWNrIiwib3B0aW9uYWwiLCJUcmFjayIsIkFkZHJlc3MiLCJwaG90byIsIlBob3RvIiwiY291bnNlbG9yIiwiQ291bnNlbG9yTmFtZSIsIkNvdW5zZWxvckVtYWlsIiwiQ291bnNlbG9yU3RhZmZHVSIsInVuZGVmaW5lZCIsImN1cnJlbnRTY2hvb2wiLCJDdXJyZW50U2Nob29sIiwiZGVudGlzdCIsIkRlbnRpc3QiLCJvZmZpY2UiLCJwaHlzaWNpYW4iLCJQaHlzaWNpYW4iLCJob3NwaXRhbCIsIlBlcm1JRCIsIk9yZ1llYXJHVSIsIlBob25lIiwiRU1haWwiLCJnZW5kZXIiLCJHZW5kZXIiLCJncmFkZSIsIkdyYWRlIiwibG9ja2VySW5mb1JlY29yZHMiLCJMb2NrZXJJbmZvUmVjb3JkcyIsImhvbWVMYW5ndWFnZSIsIkhvbWVMYW5ndWFnZSIsImhvbWVSb29tIiwiSG9tZVJvb20iLCJob21lUm9vbVRlYWNoZXIiLCJIb21lUm9vbVRjaEVNYWlsIiwiSG9tZVJvb21UY2giLCJIb21lUm9vbVRjaFN0YWZmR1UiLCJmZXRjaEV2ZW50c1dpdGhpbkludGVydmFsIiwiUmVxdWVzdERhdGUiLCJ0b0lTT1N0cmluZyIsImNhbGVuZGFyIiwib3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwiY29uY3VycmVuY3kiLCJjYWwiLCJjYWNoZSIsIm1lbW8iLCJzY2hvb2xFbmREYXRlIiwiaW50ZXJ2YWwiLCJDYWxlbmRhckxpc3RpbmciLCJzY2hvb2xTdGFydERhdGUiLCJtb250aHNXaXRoaW5TY2hvb2xZZWFyIiwiZWFjaE1vbnRoT2ZJbnRlcnZhbCIsImdldEFsbEV2ZW50c1dpdGhpblNjaG9vbFllYXIiLCJhbGwiLCJhc3luY1Bvb2xBbGwiLCJldmVudHMiLCJhbGxFdmVudHMiLCJyZWR1Y2UiLCJwcmV2Iiwic2Nob29sRGF0ZSIsIm91dHB1dFJhbmdlIiwicmVzdCIsIkV2ZW50TGlzdHMiLCJFdmVudExpc3QiLCJldmVudCIsIkV2ZW50VHlwZSIsIkFTU0lHTk1FTlQiLCJhc3NpZ25tZW50RXZlbnQiLCJhZGRMaW5rRGF0YSIsImFndSIsImRndSIsImxpbmsiLCJzdGFydFRpbWUiLCJ2aWV3VHlwZSIsIkhPTElEQVkiLCJSRUdVTEFSIiwicmVndWxhckV2ZW50IiwiXyIsInVuaXFCeSIsIml0ZW0iXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU3R1ZGVudFZ1ZS9DbGllbnQvQ2xpZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ2luQ3JlZGVudGlhbHMsIFBhcnNlZFJlcXVlc3RFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL3NvYXAvQ2xpZW50L0NsaWVudC5pbnRlcmZhY2VzJztcbmltcG9ydCBzb2FwIGZyb20gJy4uLy4uL3V0aWxzL3NvYXAvc29hcCc7XG5pbXBvcnQgeyBBZGRpdGlvbmFsSW5mbywgQWRkaXRpb25hbEluZm9JdGVtLCBDbGFzc1NjaGVkdWxlSW5mbywgU2Nob29sSW5mbywgU3R1ZGVudEluZm8gfSBmcm9tICcuL0NsaWVudC5pbnRlcmZhY2VzJztcbmltcG9ydCB7IFN0dWRlbnRJbmZvWE1MT2JqZWN0IH0gZnJvbSAnLi9JbnRlcmZhY2VzL3htbC9TdHVkZW50SW5mbyc7XG5pbXBvcnQgTWVzc2FnZSBmcm9tICcuLi9NZXNzYWdlL01lc3NhZ2UnO1xuaW1wb3J0IHsgTWVzc2FnZVhNTE9iamVjdCB9IGZyb20gJy4uL01lc3NhZ2UvTWVzc2FnZS54bWwnO1xuaW1wb3J0IHsgQXNzaWdubWVudEV2ZW50WE1MT2JqZWN0LCBDYWxlbmRhclhNTE9iamVjdCwgUmVndWxhckV2ZW50WE1MT2JqZWN0IH0gZnJvbSAnLi9JbnRlcmZhY2VzL3htbC9DYWxlbmRhcic7XG5pbXBvcnQgeyBBc3NpZ25tZW50RXZlbnQsIENhbGVuZGFyLCBDYWxlbmRhck9wdGlvbnMsIEV2ZW50LCBIb2xpZGF5RXZlbnQsIFJlZ3VsYXJFdmVudCB9IGZyb20gJy4vSW50ZXJmYWNlcy9DYWxlbmRhcic7XG5pbXBvcnQgeyBlYWNoTW9udGhPZkludGVydmFsLCBwYXJzZSB9IGZyb20gJ2RhdGUtZm5zJztcbmltcG9ydCB7IEZpbGVSZXNvdXJjZVhNTE9iamVjdCwgR3JhZGVib29rWE1MT2JqZWN0LCBVUkxSZXNvdXJjZVhNTE9iamVjdCB9IGZyb20gJy4vSW50ZXJmYWNlcy94bWwvR3JhZGVib29rJztcbmltcG9ydCB7IEF0dGVuZGFuY2VYTUxPYmplY3QgfSBmcm9tICcuL0ludGVyZmFjZXMveG1sL0F0dGVuZGFuY2UnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi9Db25zdGFudHMvRXZlbnRUeXBlJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBBc3NpZ25tZW50LCBGaWxlUmVzb3VyY2UsIEdyYWRlYm9vaywgTWFyaywgVVJMUmVzb3VyY2UsIFdlaWdodGVkQ2F0ZWdvcnkgfSBmcm9tICcuL0ludGVyZmFjZXMvR3JhZGVib29rJztcbmltcG9ydCBSZXNvdXJjZVR5cGUgZnJvbSAnLi4vLi4vQ29uc3RhbnRzL1Jlc291cmNlVHlwZSc7XG5pbXBvcnQgeyBBYnNlbnRQZXJpb2QsIEF0dGVuZGFuY2UsIFBlcmlvZEluZm8gfSBmcm9tICcuL0ludGVyZmFjZXMvQXR0ZW5kYW5jZSc7XG5pbXBvcnQgeyBTY2hlZHVsZVhNTE9iamVjdCB9IGZyb20gJy4vSW50ZXJmYWNlcy94bWwvU2NoZWR1bGUnO1xuaW1wb3J0IHsgU2NoZWR1bGUgfSBmcm9tICcuL0NsaWVudC5pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNjaG9vbEluZm9YTUxPYmplY3QgfSBmcm9tICcuL0ludGVyZmFjZXMveG1sL1NjaG9vbEluZm8nO1xuaW1wb3J0IHsgUmVwb3J0Q2FyZHNYTUxPYmplY3QgfSBmcm9tICcuLi9SZXBvcnRDYXJkL1JlcG9ydENhcmQueG1sJztcbmltcG9ydCB7IERvY3VtZW50WE1MT2JqZWN0IH0gZnJvbSAnLi4vRG9jdW1lbnQvRG9jdW1lbnQueG1sJztcbmltcG9ydCBSZXBvcnRDYXJkIGZyb20gJy4uL1JlcG9ydENhcmQvUmVwb3J0Q2FyZCc7XG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi4vRG9jdW1lbnQvRG9jdW1lbnQnO1xuaW1wb3J0IFJlcXVlc3RFeGNlcHRpb24gZnJvbSAnLi4vUmVxdWVzdEV4Y2VwdGlvbi9SZXF1ZXN0RXhjZXB0aW9uJztcbmltcG9ydCBYTUxGYWN0b3J5IGZyb20gJy4uLy4uL3V0aWxzL1hNTEZhY3RvcnkvWE1MRmFjdG9yeSc7XG5pbXBvcnQgY2FjaGUgZnJvbSAnLi4vLi4vdXRpbHMvY2FjaGUvY2FjaGUnO1xuaW1wb3J0IHsgb3B0aW9uYWwsIGFzeW5jUG9vbEFsbCB9IGZyb20gJy4vQ2xpZW50LmhlbHBlcnMnO1xuXG4vKipcbiAqIFRoZSBTdHVkZW50VlVFIENsaWVudCB0byBhY2Nlc3MgdGhlIEFQSVxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyB7c29hcC5DbGllbnR9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudCBleHRlbmRzIHNvYXAuQ2xpZW50IHtcbiAgcHJpdmF0ZSBob3N0VXJsOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKGNyZWRlbnRpYWxzOiBMb2dpbkNyZWRlbnRpYWxzLCBob3N0VXJsOiBzdHJpbmcpIHtcbiAgICBzdXBlcihjcmVkZW50aWFscyk7XG4gICAgdGhpcy5ob3N0VXJsID0gaG9zdFVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSdzIHRoZSB1c2VyJ3MgY3JlZGVudGlhbHMuIEl0IHdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgY3JlZGVudGlhbHMgYXJlIGluY29ycmVjdFxuICAgKi9cbiAgcHVibGljIHZhbGlkYXRlQ3JlZGVudGlhbHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgc3VwZXJcbiAgICAgICAgLnByb2Nlc3NSZXF1ZXN0PFBhcnNlZFJlcXVlc3RFcnJvcj4oeyBtZXRob2ROYW1lOiAnbG9naW4gdGVzdCcsIHZhbGlkYXRlRXJyb3JzOiBmYWxzZSB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICByZXMoKTtcbiAgICAgICAgICAvL2lmIChyZXNwb25zZS5SVF9FUlJPUlswXVsnQF9FUlJPUl9NRVNTQUdFJ11bMF0gPT09ICdsb2dpbiB0ZXN0IGlzIG5vdCBhIHZhbGlkIG1ldGhvZC4nIHx8IHJlc3BvbnNlLlJUX0VSUk9SWzBdWydAX0VSUk9SX01FU1NBR0UnXVswXS5pbmNsdWRlcyhcIkEgY3JpdGljYWwgZXJyb3IgaGFzIG9jY3VycmVkLlwiKSkgcmVzKCk7XG4gICAgICAgICAgLy9lbHNlIHJlaihuZXcgUmVxdWVzdEV4Y2VwdGlvbihyZXNwb25zZSkpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2gocmVqKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdHVkZW50J3MgZG9jdW1lbnRzIGZyb20gc3luZXJneSBzZXJ2ZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPERvY3VtZW50W10+fT4gUmV0dXJucyBhIGxpc3Qgb2Ygc3R1ZGVudCBkb2N1bWVudHNcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIGBgYGpzXG4gICAqIGNvbnN0IGRvY3VtZW50cyA9IGF3YWl0IGNsaWVudC5kb2N1bWVudHMoKTtcbiAgICogY29uc3QgZG9jdW1lbnQgPSBkb2N1bWVudHNbMF07XG4gICAqIGNvbnN0IGZpbGVzID0gYXdhaXQgZG9jdW1lbnQuZ2V0KCk7XG4gICAqIGNvbnN0IGJhc2U2NGNvbGxlY3Rpb24gPSBmaWxlcy5tYXAoKGZpbGUpID0+IGZpbGUuYmFzZTY0KTtcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgZG9jdW1lbnRzKCk6IFByb21pc2U8RG9jdW1lbnRbXT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHN1cGVyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxEb2N1bWVudFhNTE9iamVjdD4oe1xuICAgICAgICAgIG1ldGhvZE5hbWU6ICdHZXRTdHVkZW50RG9jdW1lbnRJbml0aWFsRGF0YScsXG4gICAgICAgICAgcGFyYW1TdHI6IHsgY2hpbGRJbnRJZDogMCB9LFxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoeG1sT2JqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzKFxuICAgICAgICAgICAgeG1sT2JqZWN0WydTdHVkZW50RG9jdW1lbnRzJ11bMF0uU3R1ZGVudERvY3VtZW50RGF0YXNbMF0uU3R1ZGVudERvY3VtZW50RGF0YS5tYXAoXG4gICAgICAgICAgICAgICh4bWwpID0+IG5ldyBEb2N1bWVudCh4bWwsIHN1cGVyLmNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChyZWopO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIHJlcG9ydCBjYXJkc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxSZXBvcnRDYXJkW10+fSBSZXR1cm5zIGEgbGlzdCBvZiByZXBvcnQgY2FyZHMgdGhhdCBjYW4gZmV0Y2ggYSBmaWxlXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBgYGBqc1xuICAgKiBjb25zdCByZXBvcnRDYXJkcyA9IGF3YWl0IGNsaWVudC5yZXBvcnRDYXJkcygpO1xuICAgKiBjb25zdCBmaWxlcyA9IGF3YWl0IFByb21pc2UuYWxsKHJlcG9ydENhcmRzLm1hcCgoY2FyZCkgPT4gY2FyZC5nZXQoKSkpO1xuICAgKiBjb25zdCBiYXNlNjRhcnIgPSBmaWxlcy5tYXAoKGZpbGUpID0+IGZpbGUuYmFzZTY0KTsgLy8gW1wiSlZCRVJpMC4uLlwiLCBcImRVSW9hMS4uLlwiLCAuLi5dO1xuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyByZXBvcnRDYXJkcygpOiBQcm9taXNlPFJlcG9ydENhcmRbXT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHN1cGVyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxSZXBvcnRDYXJkc1hNTE9iamVjdD4oe1xuICAgICAgICAgIG1ldGhvZE5hbWU6ICdHZXRSZXBvcnRDYXJkSW5pdGlhbERhdGEnLFxuICAgICAgICAgIHBhcmFtU3RyOiB7IGNoaWxkSW50SWQ6IDAgfSxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHhtbE9iamVjdCkgPT4ge1xuICAgICAgICAgIHJlcyhcbiAgICAgICAgICAgIHhtbE9iamVjdC5SQ1JlcG9ydGluZ1BlcmlvZERhdGFbMF0uUkNSZXBvcnRpbmdQZXJpb2RzWzBdLlJDUmVwb3J0aW5nUGVyaW9kLm1hcChcbiAgICAgICAgICAgICAgKHhtbCkgPT4gbmV3IFJlcG9ydENhcmQoeG1sLCBzdXBlci5jcmVkZW50aWFscylcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2gocmVqKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdHVkZW50J3Mgc2Nob29sJ3MgaW5mb3JtYXRpb25cbiAgICogQHJldHVybnMge1Byb21pc2U8U2Nob29sSW5mbz59IFJldHVybnMgdGhlIGluZm9ybWF0aW9uIG9mIHRoZSBzdHVkZW50J3Mgc2Nob29sXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBgYGBqc1xuICAgKiBhd2FpdCBjbGllbnQuc2Nob29sSW5mbygpO1xuICAgKlxuICAgKiBjbGllbnQuc2Nob29sSW5mbygpLnRoZW4oKHNjaG9vbEluZm8pID0+IHtcbiAgICogIGNvbnNvbGUubG9nKF8udW5pcShzY2hvb2xJbmZvLnN0YWZmLm1hcCgoc3RhZmYpID0+IHN0YWZmLm5hbWUpKSk7IC8vIExpc3QgYWxsIHN0YWZmIHBvc2l0aW9ucyB1c2luZyBsb2Rhc2hcbiAgICogfSlcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgc2Nob29sSW5mbygpOiBQcm9taXNlPFNjaG9vbEluZm8+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICBzdXBlclxuICAgICAgICAucHJvY2Vzc1JlcXVlc3Q8U2Nob29sSW5mb1hNTE9iamVjdD4oe1xuICAgICAgICAgIG1ldGhvZE5hbWU6ICdTdHVkZW50U2Nob29sSW5mbycsXG4gICAgICAgICAgcGFyYW1TdHI6IHsgY2hpbGRJbnRJRDogMCB9LFxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoeyBTdHVkZW50U2Nob29sSW5mb0xpc3Rpbmc6IFt4bWxPYmplY3RdIH0pID0+IHtcbiAgICAgICAgICByZXMoe1xuICAgICAgICAgICAgc2Nob29sOiB7XG4gICAgICAgICAgICAgIGFkZHJlc3M6IHhtbE9iamVjdFsnQF9TY2hvb2xBZGRyZXNzJ11bMF0sXG4gICAgICAgICAgICAgIGFkZHJlc3NBbHQ6IHhtbE9iamVjdFsnQF9TY2hvb2xBZGRyZXNzMiddWzBdLFxuICAgICAgICAgICAgICBjaXR5OiB4bWxPYmplY3RbJ0BfU2Nob29sQ2l0eSddWzBdLFxuICAgICAgICAgICAgICB6aXBDb2RlOiB4bWxPYmplY3RbJ0BfU2Nob29sWmlwJ11bMF0sXG4gICAgICAgICAgICAgIHBob25lOiB4bWxPYmplY3RbJ0BfUGhvbmUnXVswXSxcbiAgICAgICAgICAgICAgYWx0UGhvbmU6IHhtbE9iamVjdFsnQF9QaG9uZTInXVswXSxcbiAgICAgICAgICAgICAgcHJpbmNpcGFsOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0WydAX1ByaW5jaXBhbCddWzBdLFxuICAgICAgICAgICAgICAgIGVtYWlsOiB4bWxPYmplY3RbJ0BfUHJpbmNpcGFsRW1haWwnXVswXSxcbiAgICAgICAgICAgICAgICBzdGFmZkd1OiB4bWxPYmplY3RbJ0BfUHJpbmNpcGFsR3UnXVswXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFmZjogeG1sT2JqZWN0LlN0YWZmTGlzdHNbMF0uU3RhZmZMaXN0Lm1hcCgoc3RhZmYpID0+ICh7XG4gICAgICAgICAgICAgIG5hbWU6IHN0YWZmWydAX05hbWUnXVswXSxcbiAgICAgICAgICAgICAgZW1haWw6IHN0YWZmWydAX0VNYWlsJ11bMF0sXG4gICAgICAgICAgICAgIHN0YWZmR3U6IHN0YWZmWydAX1N0YWZmR1UnXVswXSxcbiAgICAgICAgICAgICAgam9iVGl0bGU6IHN0YWZmWydAX1RpdGxlJ11bMF0sXG4gICAgICAgICAgICAgIGV4dG46IHN0YWZmWydAX0V4dG4nXVswXSxcbiAgICAgICAgICAgICAgcGhvbmU6IHN0YWZmWydAX1Bob25lJ11bMF0sXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChyZWopO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHNjaGVkdWxlIG9mIHRoZSBzdHVkZW50XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0ZXJtSW5kZXggVGhlIGluZGV4IG9mIHRoZSB0ZXJtLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxTY2hlZHVsZT59IFJldHVybnMgdGhlIHNjaGVkdWxlIG9mIHRoZSBzdHVkZW50XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBgYGBqc1xuICAgKiBhd2FpdCBzY2hlZHVsZSgwKSAvLyAtPiB7IHRlcm06IHsgaW5kZXg6IDAsIG5hbWU6ICcxc3QgUXRyIFByb2dyZXNzJyB9LCAuLi4gfVxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBzY2hlZHVsZSh0ZXJtSW5kZXg/OiBudW1iZXIpOiBQcm9taXNlPFNjaGVkdWxlPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgc3VwZXJcbiAgICAgICAgLnByb2Nlc3NSZXF1ZXN0PFNjaGVkdWxlWE1MT2JqZWN0Pih7XG4gICAgICAgICAgbWV0aG9kTmFtZTogJ1N0dWRlbnRDbGFzc0xpc3QnLFxuICAgICAgICAgIHBhcmFtU3RyOiB7IGNoaWxkSW50SWQ6IDAsIC4uLih0ZXJtSW5kZXggIT0gbnVsbCA/IHsgVGVybUluZGV4OiB0ZXJtSW5kZXggfSA6IHt9KSB9LFxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoeG1sT2JqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzKHtcbiAgICAgICAgICAgIHRlcm06IHtcbiAgICAgICAgICAgICAgaW5kZXg6IE51bWJlcih4bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF1bJ0BfVGVybUluZGV4J11bMF0pLFxuICAgICAgICAgICAgICBuYW1lOiB4bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF1bJ0BfVGVybUluZGV4TmFtZSddWzBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiB4bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF1bJ0BfRXJyb3JNZXNzYWdlJ11bMF0sXG4gICAgICAgICAgICB0b2RheTpcbiAgICAgICAgICAgICAgdHlwZW9mIHhtbE9iamVjdC5TdHVkZW50Q2xhc3NTY2hlZHVsZVswXS5Ub2RheVNjaGVkdWxlSW5mb0RhdGFbMF0uU2Nob29sSW5mb3NbMF0gIT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgPyB4bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF0uVG9kYXlTY2hlZHVsZUluZm9EYXRhWzBdLlNjaG9vbEluZm9zWzBdLlNjaG9vbEluZm8ubWFwKFxuICAgICAgICAgICAgICAgICAgICAoc2Nob29sKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNjaG9vbFsnQF9TY2hvb2xOYW1lJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgYmVsbFNjaGVkdWxlTmFtZTogc2Nob29sWydAX0JlbGxTY2hlZE5hbWUnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzOlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHNjaG9vbC5DbGFzc2VzWzBdICE9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICA/IHNjaG9vbC5DbGFzc2VzWzBdLkNsYXNzSW5mby5tYXA8Q2xhc3NTY2hlZHVsZUluZm8+KChjb3Vyc2UpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IE51bWJlcihjb3Vyc2VbJ0BfUGVyaW9kJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ZW5kYW5jZUNvZGU6IGNvdXJzZS5BdHRlbmRhbmNlQ29kZVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKGNvdXJzZVsnQF9TdGFydERhdGUnXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoY291cnNlWydAX0VuZERhdGUnXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY291cnNlWydAX0NsYXNzTmFtZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbkd1OiBjb3Vyc2VbJ0BfU2VjdGlvbkdVJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBjb3Vyc2VbJ0BfVGVhY2hlckVtYWlsJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsU3ViamVjdDogY291cnNlWydAX0VtYWlsU3ViamVjdCddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb3Vyc2VbJ0BfVGVhY2hlck5hbWUnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhZmZHdTogY291cnNlWydAX1N0YWZmR1UnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBjb3Vyc2VbJ0BfVGVhY2hlclVSTCddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogY291cnNlWydAX0NsYXNzVVJMJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBwYXJzZShjb3Vyc2VbJ0BfU3RhcnRUaW1lJ11bMF0sICdoaDptbSBhJywgRGF0ZS5ub3coKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogcGFyc2UoY291cnNlWydAX0VuZFRpbWUnXVswXSwgJ2hoOm1tIGEnLCBEYXRlLm5vdygpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogW10sXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgOiBbXSxcbiAgICAgICAgICAgIGNsYXNzZXM6XG4gICAgICAgICAgICAgIHR5cGVvZiB4bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF0uQ2xhc3NMaXN0c1swXSAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICA/IHhtbE9iamVjdC5TdHVkZW50Q2xhc3NTY2hlZHVsZVswXS5DbGFzc0xpc3RzWzBdLkNsYXNzTGlzdGluZy5tYXAoKHN0dWRlbnRDbGFzcykgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogc3R1ZGVudENsYXNzWydAX0NvdXJzZVRpdGxlJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgIHBlcmlvZDogTnVtYmVyKHN0dWRlbnRDbGFzc1snQF9QZXJpb2QnXVswXSksXG4gICAgICAgICAgICAgICAgICAgIHJvb206IHN0dWRlbnRDbGFzc1snQF9Sb29tTmFtZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICBzZWN0aW9uR3U6IHN0dWRlbnRDbGFzc1snQF9TZWN0aW9uR1UnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgdGVhY2hlcjoge1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0dWRlbnRDbGFzc1snQF9UZWFjaGVyJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHN0dWRlbnRDbGFzc1snQF9UZWFjaGVyRW1haWwnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICBzdGFmZkd1OiBzdHVkZW50Q2xhc3NbJ0BfVGVhY2hlclN0YWZmR1UnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIDogW10sXG4gICAgICAgICAgICB0ZXJtczogeG1sT2JqZWN0LlN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLlRlcm1MaXN0c1swXS5UZXJtTGlzdGluZy5tYXAoKHRlcm0pID0+ICh7XG4gICAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgICBzdGFydDogbmV3IERhdGUodGVybVsnQF9CZWdpbkRhdGUnXVswXSksXG4gICAgICAgICAgICAgICAgZW5kOiBuZXcgRGF0ZSh0ZXJtWydAX0VuZERhdGUnXVswXSksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGluZGV4OiBOdW1iZXIodGVybVsnQF9UZXJtSW5kZXgnXVswXSksXG4gICAgICAgICAgICAgIG5hbWU6IHRlcm1bJ0BfVGVybU5hbWUnXVswXSxcbiAgICAgICAgICAgICAgc2Nob29sWWVhclRlcm1Db2RlR3U6IHRlcm1bJ0BfU2Nob29sWWVhclRybUNvZGVHVSddWzBdLFxuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2gocmVqKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhdHRlbmRhbmNlIG9mIHRoZSBzdHVkZW50XG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEF0dGVuZGFuY2U+fSBSZXR1cm5zIGFuIEF0dGVuZGFuY2Ugb2JqZWN0XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBgYGBqc1xuICAgKiBjbGllbnQuYXR0ZW5kYW5jZSgpXG4gICAqICAudGhlbihjb25zb2xlLmxvZyk7IC8vIC0+IHsgdHlwZTogJ1BlcmlvZCcsIHBlcmlvZDogey4uLn0sIHNjaG9vbE5hbWU6ICdVbml2ZXJzaXR5IEhpZ2ggU2Nob29sJywgYWJzZW5jZXM6IFsuLi5dLCBwZXJpb2RJbmZvczogWy4uLl0gfVxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBhdHRlbmRhbmNlKCk6IFByb21pc2U8QXR0ZW5kYW5jZT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHN1cGVyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxBdHRlbmRhbmNlWE1MT2JqZWN0Pih7XG4gICAgICAgICAgbWV0aG9kTmFtZTogJ0F0dGVuZGFuY2UnLFxuICAgICAgICAgIHBhcmFtU3RyOiB7XG4gICAgICAgICAgICBjaGlsZEludElkOiAwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChhdHRlbmRhbmNlWE1MT2JqZWN0KSA9PiB7XG4gICAgICAgICAgY29uc3QgeG1sT2JqZWN0ID0gYXR0ZW5kYW5jZVhNTE9iamVjdC5BdHRlbmRhbmNlWzBdO1xuXG4gICAgICAgICAgcmVzKHtcbiAgICAgICAgICAgIHR5cGU6IHhtbE9iamVjdFsnQF9UeXBlJ11bMF0sXG4gICAgICAgICAgICBwZXJpb2Q6IHtcbiAgICAgICAgICAgICAgdG90YWw6IE51bWJlcih4bWxPYmplY3RbJ0BfUGVyaW9kQ291bnQnXVswXSksXG4gICAgICAgICAgICAgIHN0YXJ0OiBOdW1iZXIoeG1sT2JqZWN0WydAX1N0YXJ0UGVyaW9kJ11bMF0pLFxuICAgICAgICAgICAgICBlbmQ6IE51bWJlcih4bWxPYmplY3RbJ0BfRW5kUGVyaW9kJ11bMF0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjaG9vbE5hbWU6IHhtbE9iamVjdFsnQF9TY2hvb2xOYW1lJ11bMF0sXG4gICAgICAgICAgICBhYnNlbmNlczogeG1sT2JqZWN0LkFic2VuY2VzWzBdLkFic2VuY2VcbiAgICAgICAgICAgICAgPyB4bWxPYmplY3QuQWJzZW5jZXNbMF0uQWJzZW5jZS5tYXAoKGFic2VuY2UpID0+ICh7XG4gICAgICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZShhYnNlbmNlWydAX0Fic2VuY2VEYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgcmVhc29uOiBhYnNlbmNlWydAX1JlYXNvbiddWzBdLFxuICAgICAgICAgICAgICAgICAgbm90ZTogYWJzZW5jZVsnQF9Ob3RlJ11bMF0sXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYWJzZW5jZVsnQF9Db2RlQWxsRGF5RGVzY3JpcHRpb24nXVswXSxcbiAgICAgICAgICAgICAgICAgIHBlcmlvZHM6IGFic2VuY2UuUGVyaW9kc1swXS5QZXJpb2QubWFwKFxuICAgICAgICAgICAgICAgICAgICAocGVyaW9kKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IE51bWJlcihwZXJpb2RbJ0BfTnVtYmVyJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGVyaW9kWydAX05hbWUnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcGVyaW9kWydAX1JlYXNvbiddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291cnNlOiBwZXJpb2RbJ0BfQ291cnNlJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFmZjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwZXJpb2RbJ0BfU3RhZmYnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhZmZHdTogcGVyaW9kWydAX1N0YWZmR1UnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHBlcmlvZFsnQF9TdGFmZkVNYWlsJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JnWWVhckd1OiBwZXJpb2RbJ0BfT3JnWWVhckdVJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgfSBhcyBBYnNlbnRQZXJpb2QpXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICA6IFtdLFxuICAgICAgICAgICAgcGVyaW9kSW5mb3M6IHhtbE9iamVjdC5Ub3RhbEFjdGl2aXRpZXNbMF0uUGVyaW9kVG90YWwubWFwKChwZCwgaSkgPT4gKHtcbiAgICAgICAgICAgICAgcGVyaW9kOiBOdW1iZXIocGRbJ0BfTnVtYmVyJ11bMF0pLFxuICAgICAgICAgICAgICB0b3RhbDoge1xuICAgICAgICAgICAgICAgIGV4Y3VzZWQ6IE51bWJlcih4bWxPYmplY3QuVG90YWxFeGN1c2VkWzBdLlBlcmlvZFRvdGFsW2ldWydAX1RvdGFsJ11bMF0pLFxuICAgICAgICAgICAgICAgIHRhcmRpZXM6IE51bWJlcih4bWxPYmplY3QuVG90YWxUYXJkaWVzWzBdLlBlcmlvZFRvdGFsW2ldWydAX1RvdGFsJ11bMF0pLFxuICAgICAgICAgICAgICAgIHVuZXhjdXNlZDogTnVtYmVyKHhtbE9iamVjdC5Ub3RhbFVuZXhjdXNlZFswXS5QZXJpb2RUb3RhbFtpXVsnQF9Ub3RhbCddWzBdKSxcbiAgICAgICAgICAgICAgICBhY3Rpdml0aWVzOiBOdW1iZXIoeG1sT2JqZWN0LlRvdGFsQWN0aXZpdGllc1swXS5QZXJpb2RUb3RhbFtpXVsnQF9Ub3RhbCddWzBdKSxcbiAgICAgICAgICAgICAgICB1bmV4Y3VzZWRUYXJkaWVzOiBOdW1iZXIoeG1sT2JqZWN0LlRvdGFsVW5leGN1c2VkVGFyZGllc1swXS5QZXJpb2RUb3RhbFtpXVsnQF9Ub3RhbCddWzBdKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pKSBhcyBQZXJpb2RJbmZvW10sXG4gICAgICAgICAgfSBhcyBBdHRlbmRhbmNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHJlaik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZ3JhZGVib29rIG9mIHRoZSBzdHVkZW50XG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZXBvcnRpbmdQZXJpb2RJbmRleCBUaGUgdGltZWZyYW1lIHRoYXQgdGhlIGdyYWRlYm9vayBzaG91bGQgcmV0dXJuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEdyYWRlYm9vaz59IFJldHVybnMgYSBHcmFkZWJvb2sgb2JqZWN0XG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBgYGBqc1xuICAgKiBjb25zdCBncmFkZWJvb2sgPSBhd2FpdCBjbGllbnQuZ3JhZGVib29rKCk7XG4gICAqIGNvbnNvbGUubG9nKGdyYWRlYm9vayk7IC8vIHsgZXJyb3I6ICcnLCB0eXBlOiAnVHJhZGl0aW9uYWwnLCByZXBvcnRpbmdQZXJpb2Q6IHsuLi59LCBjb3Vyc2VzOiBbLi4uXSB9O1xuICAgKlxuICAgKiBhd2FpdCBjbGllbnQuZ3JhZGVib29rKDApIC8vIFNvbWUgc2Nob29scyB3aWxsIGhhdmUgUmVwb3J0aW5nUGVyaW9kSW5kZXggMCBhcyBcIjFzdCBRdWFydGVyIFByb2dyZXNzXCJcbiAgICogYXdhaXQgY2xpZW50LmdyYWRlYm9vayg3KSAvLyBTb21lIHNjaG9vbHMgd2lsbCBoYXZlIFJlcG9ydGluZ1BlcmlvZEluZGV4IDcgYXMgXCI0dGggUXVhcnRlclwiXG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIGdyYWRlYm9vayhyZXBvcnRpbmdQZXJpb2RJbmRleD86IG51bWJlcik6IFByb21pc2U8R3JhZGVib29rPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgc3VwZXJcbiAgICAgICAgLnByb2Nlc3NSZXF1ZXN0PEdyYWRlYm9va1hNTE9iamVjdD4oXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kTmFtZTogJ0dyYWRlYm9vaycsXG4gICAgICAgICAgICBwYXJhbVN0cjoge1xuICAgICAgICAgICAgICBjaGlsZEludElkOiAwLFxuICAgICAgICAgICAgICAuLi4ocmVwb3J0aW5nUGVyaW9kSW5kZXggIT0gbnVsbCA/IHsgUmVwb3J0UGVyaW9kOiByZXBvcnRpbmdQZXJpb2RJbmRleCB9IDoge30pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgICh4bWwpID0+XG4gICAgICAgICAgICBuZXcgWE1MRmFjdG9yeSh4bWwpXG4gICAgICAgICAgICAgIC5lbmNvZGVBdHRyaWJ1dGUoJ01lYXN1cmVEZXNjcmlwdGlvbicsICdIYXNEcm9wQm94JylcbiAgICAgICAgICAgICAgLmVuY29kZUF0dHJpYnV0ZSgnTWVhc3VyZScsICdUeXBlJylcbiAgICAgICAgICAgICAgLnRvU3RyaW5nKClcbiAgICAgICAgKVxuICAgICAgICAudGhlbigoeG1sT2JqZWN0OiBHcmFkZWJvb2tYTUxPYmplY3QpID0+IHtcbiAgICAgICAgICByZXMoe1xuICAgICAgICAgICAgZXJyb3I6IHhtbE9iamVjdC5HcmFkZWJvb2tbMF1bJ0BfRXJyb3JNZXNzYWdlJ11bMF0sXG4gICAgICAgICAgICB0eXBlOiB4bWxPYmplY3QuR3JhZGVib29rWzBdWydAX1R5cGUnXVswXSxcbiAgICAgICAgICAgIHJlcG9ydGluZ1BlcmlvZDoge1xuICAgICAgICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICAgICAgICByZXBvcnRpbmdQZXJpb2RJbmRleCA/P1xuICAgICAgICAgICAgICAgICAgTnVtYmVyKFxuICAgICAgICAgICAgICAgICAgICB4bWxPYmplY3QuR3JhZGVib29rWzBdLlJlcG9ydGluZ1BlcmlvZHNbMF0uUmVwb3J0UGVyaW9kLmZpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgKHgpID0+IHhbJ0BfR3JhZGVQZXJpb2QnXVswXSA9PT0geG1sT2JqZWN0LkdyYWRlYm9va1swXS5SZXBvcnRpbmdQZXJpb2RbMF1bJ0BfR3JhZGVQZXJpb2QnXVswXVxuICAgICAgICAgICAgICAgICAgICApPy5bJ0BfSW5kZXgnXVswXVxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBzdGFydDogbmV3IERhdGUoeG1sT2JqZWN0LkdyYWRlYm9va1swXS5SZXBvcnRpbmdQZXJpb2RbMF1bJ0BfU3RhcnREYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgZW5kOiBuZXcgRGF0ZSh4bWxPYmplY3QuR3JhZGVib29rWzBdLlJlcG9ydGluZ1BlcmlvZFswXVsnQF9FbmREYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0LkdyYWRlYm9va1swXS5SZXBvcnRpbmdQZXJpb2RbMF1bJ0BfR3JhZGVQZXJpb2QnXVswXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXZhaWxhYmxlOiB4bWxPYmplY3QuR3JhZGVib29rWzBdLlJlcG9ydGluZ1BlcmlvZHNbMF0uUmVwb3J0UGVyaW9kLm1hcCgocGVyaW9kKSA9PiAoe1xuICAgICAgICAgICAgICAgIGRhdGU6IHsgc3RhcnQ6IG5ldyBEYXRlKHBlcmlvZFsnQF9TdGFydERhdGUnXVswXSksIGVuZDogbmV3IERhdGUocGVyaW9kWydAX0VuZERhdGUnXVswXSkgfSxcbiAgICAgICAgICAgICAgICBuYW1lOiBwZXJpb2RbJ0BfR3JhZGVQZXJpb2QnXVswXSxcbiAgICAgICAgICAgICAgICBpbmRleDogTnVtYmVyKHBlcmlvZFsnQF9JbmRleCddWzBdKSxcbiAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvdXJzZXM6IHhtbE9iamVjdC5HcmFkZWJvb2tbMF0uQ291cnNlc1swXS5Db3Vyc2UubWFwKChjb3Vyc2UpID0+ICh7XG4gICAgICAgICAgICAgIHBlcmlvZDogTnVtYmVyKGNvdXJzZVsnQF9QZXJpb2QnXVswXSksXG4gICAgICAgICAgICAgIHRpdGxlOiBjb3Vyc2VbJ0BfVGl0bGUnXVswXSxcbiAgICAgICAgICAgICAgcm9vbTogY291cnNlWydAX1Jvb20nXVswXSxcbiAgICAgICAgICAgICAgc3RhZmY6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBjb3Vyc2VbJ0BfU3RhZmYnXVswXSxcbiAgICAgICAgICAgICAgICBlbWFpbDogY291cnNlWydAX1N0YWZmRU1haWwnXVswXSxcbiAgICAgICAgICAgICAgICBzdGFmZkd1OiBjb3Vyc2VbJ0BfU3RhZmZHVSddWzBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBtYXJrczogY291cnNlLk1hcmtzWzBdLk1hcmsubWFwKChtYXJrKSA9PiAoe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1hcmtbJ0BfTWFya05hbWUnXVswXSxcbiAgICAgICAgICAgICAgICBjYWxjdWxhdGVkU2NvcmU6IHtcbiAgICAgICAgICAgICAgICAgIHN0cmluZzogbWFya1snQF9DYWxjdWxhdGVkU2NvcmVTdHJpbmcnXVswXSxcbiAgICAgICAgICAgICAgICAgIHJhdzogTnVtYmVyKG1hcmtbJ0BfQ2FsY3VsYXRlZFNjb3JlUmF3J11bMF0pLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2VpZ2h0ZWRDYXRlZ29yaWVzOlxuICAgICAgICAgICAgICAgICAgdHlwZW9mIG1hcmtbJ0dyYWRlQ2FsY3VsYXRpb25TdW1tYXJ5J11bMF0gIT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgID8gbWFya1snR3JhZGVDYWxjdWxhdGlvblN1bW1hcnknXVswXS5Bc3NpZ25tZW50R3JhZGVDYWxjLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICh3ZWlnaHRlZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB3ZWlnaHRlZFsnQF9UeXBlJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsY3VsYXRlZE1hcms6IHdlaWdodGVkWydAX0NhbGN1bGF0ZWRNYXJrJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZWQ6IHdlaWdodGVkWydAX1dlaWdodGVkUGN0J11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZDogd2VpZ2h0ZWRbJ0BfV2VpZ2h0J11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IE51bWJlcih3ZWlnaHRlZFsnQF9Qb2ludHMnXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZTogTnVtYmVyKHdlaWdodGVkWydAX1BvaW50c1Bvc3NpYmxlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgV2VpZ2h0ZWRDYXRlZ29yeSlcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIDogW10sXG4gICAgICAgICAgICAgICAgYXNzaWdubWVudHM6XG4gICAgICAgICAgICAgICAgICB0eXBlb2YgbWFyay5Bc3NpZ25tZW50c1swXSAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgPyAobWFyay5Bc3NpZ25tZW50c1swXS5Bc3NpZ25tZW50Lm1hcCgoYXNzaWdubWVudCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyYWRlYm9va0lkOiBhc3NpZ25tZW50WydAX0dyYWRlYm9va0lEJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBkZWNvZGVVUkkoYXNzaWdubWVudFsnQF9NZWFzdXJlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogYXNzaWdubWVudFsnQF9UeXBlJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZShhc3NpZ25tZW50WydAX0RhdGUnXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGR1ZTogbmV3IERhdGUoYXNzaWdubWVudFsnQF9EdWVEYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGFzc2lnbm1lbnRbJ0BfU2NvcmVUeXBlJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhc3NpZ25tZW50WydAX1Njb3JlJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzOiBhc3NpZ25tZW50WydAX1BvaW50cyddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXM6IGFzc2lnbm1lbnRbJ0BfTm90ZXMnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJJZDogYXNzaWdubWVudFsnQF9UZWFjaGVySUQnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZWNvZGVVUkkoYXNzaWdubWVudFsnQF9NZWFzdXJlRGVzY3JpcHRpb24nXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNEcm9wYm94OiBKU09OLnBhcnNlKGFzc2lnbm1lbnRbJ0BfSGFzRHJvcEJveCddWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRJZDogYXNzaWdubWVudFsnQF9TdHVkZW50SUQnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bib3hEYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZShhc3NpZ25tZW50WydAX0Ryb3BTdGFydERhdGUnXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoYXNzaWdubWVudFsnQF9Ecm9wRW5kRGF0ZSddWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBhc3NpZ25tZW50LlJlc291cmNlc1swXSAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChhc3NpZ25tZW50LlJlc291cmNlc1swXS5SZXNvdXJjZS5tYXAoKHJzcmMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChyc3JjWydAX1R5cGUnXVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0ZpbGUnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUnNyYyA9IHJzcmMgYXMgRmlsZVJlc291cmNlWE1MT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogUmVzb3VyY2VUeXBlLkZJTEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmaWxlUnNyY1snQF9GaWxlVHlwZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGZpbGVSc3JjWydAX0ZpbGVOYW1lJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpOiB0aGlzLmhvc3RVcmwgKyBmaWxlUnNyY1snQF9TZXJ2ZXJGaWxlTmFtZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKGZpbGVSc3JjWydAX1Jlc291cmNlRGF0ZSddWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZmlsZVJzcmNbJ0BfUmVzb3VyY2VJRCddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGZpbGVSc3JjWydAX1Jlc291cmNlTmFtZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBGaWxlUmVzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ1VSTCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybFJzcmMgPSByc3JjIGFzIFVSTFJlc291cmNlWE1MT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxSc3JjWydAX1VSTCddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBSZXNvdXJjZVR5cGUuVVJMLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKHVybFJzcmNbJ0BfUmVzb3VyY2VEYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1cmxSc3JjWydAX1Jlc291cmNlSUQnXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB1cmxSc3JjWydAX1Jlc291cmNlTmFtZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB1cmxSc3JjWydAX1Jlc291cmNlRGVzY3JpcHRpb24nXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogdXJsUnNyY1snQF9TZXJ2ZXJGaWxlTmFtZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBVUkxSZXNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlaihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFR5cGUgJHtyc3JjWydAX1R5cGUnXVswXX0gZG9lcyBub3QgZXhpc3QgYXMgYSB0eXBlLiBBZGQgaXQgdG8gdHlwZSBkZWNsYXJhdGlvbnMuYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgYXMgKEZpbGVSZXNvdXJjZSB8IFVSTFJlc291cmNlKVtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogW10sXG4gICAgICAgICAgICAgICAgICAgICAgfSkpIGFzIEFzc2lnbm1lbnRbXSlcbiAgICAgICAgICAgICAgICAgICAgOiBbXSxcbiAgICAgICAgICAgICAgfSkpIGFzIE1hcmtbXSxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICB9IGFzIEdyYWRlYm9vayk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChyZWopO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgbWVzc2FnZXMgb2YgdGhlIHN0dWRlbnRcbiAgICogQHJldHVybnMge1Byb21pc2U8TWVzc2FnZVtdPn0gUmV0dXJucyBhbiBhcnJheSBvZiBtZXNzYWdlcyBvZiB0aGUgc3R1ZGVudFxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogYGBganNcbiAgICogYXdhaXQgY2xpZW50Lm1lc3NhZ2VzKCk7IC8vIC0+IFt7IGlkOiAnRTk3MkYxQkMtOTlBMC00Q0QwLThEMTUtQjE4OTY4QjQzRTA4JywgdHlwZTogJ1N0dWRlbnRBY3Rpdml0eScsIC4uLiB9LCB7IGlkOiAnODZGREExMUQtNDJDNy00MjQ5LUIwMDMtOTRCMTVFQjJDOEQ0JywgdHlwZTogJ1N0dWRlbnRBY3Rpdml0eScsIC4uLiB9XVxuICAgKiBgYGBcbiAgICovXG4gIHB1YmxpYyBtZXNzYWdlcygpOiBQcm9taXNlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHN1cGVyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxNZXNzYWdlWE1MT2JqZWN0PihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2ROYW1lOiAnR2V0UFhQTWVzc2FnZXMnLFxuICAgICAgICAgICAgcGFyYW1TdHI6IHsgY2hpbGRJbnRJZDogMCB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgKHhtbCkgPT4gbmV3IFhNTEZhY3RvcnkoeG1sKS5lbmNvZGVBdHRyaWJ1dGUoJ0NvbnRlbnQnLCAnUmVhZCcpLnRvU3RyaW5nKClcbiAgICAgICAgKVxuICAgICAgICAudGhlbigoeG1sT2JqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzKFxuICAgICAgICAgICAgeG1sT2JqZWN0LlBYUE1lc3NhZ2VzRGF0YVswXS5NZXNzYWdlTGlzdGluZ3NbMF0uTWVzc2FnZUxpc3RpbmcgPyB4bWxPYmplY3QuUFhQTWVzc2FnZXNEYXRhWzBdLk1lc3NhZ2VMaXN0aW5nc1swXS5NZXNzYWdlTGlzdGluZy5tYXAoXG4gICAgICAgICAgICAgIChtZXNzYWdlKSA9PiBuZXcgTWVzc2FnZShtZXNzYWdlLCBzdXBlci5jcmVkZW50aWFscywgdGhpcy5ob3N0VXJsKVxuICAgICAgICAgICAgKSA6IFtdXG4gICAgICAgICAgKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHJlaik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaW5mbyBvZiBhIHN0dWRlbnRcbiAgICogQHJldHVybnMge1Byb21pc2U8U3R1ZGVudEluZm8+fSBTdHVkZW50SW5mbyBvYmplY3RcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIGBgYGpzXG4gICAqIHN0dWRlbnRJbmZvKCkudGhlbihjb25zb2xlLmxvZykgLy8gLT4geyBzdHVkZW50OiB7IG5hbWU6ICdFdmFuIERhdmlzJywgbmlja25hbWU6ICcnLCBsYXN0TmFtZTogJ0RhdmlzJyB9LCAuLi59XG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIHN0dWRlbnRJbmZvKCk6IFByb21pc2U8U3R1ZGVudEluZm8+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8U3R1ZGVudEluZm8+KChyZXMsIHJlaikgPT4ge1xuICAgICAgc3VwZXJcbiAgICAgICAgLnByb2Nlc3NSZXF1ZXN0PFN0dWRlbnRJbmZvWE1MT2JqZWN0Pih7XG4gICAgICAgICAgbWV0aG9kTmFtZTogJ1N0dWRlbnRJbmZvJyxcbiAgICAgICAgICBwYXJhbVN0cjogeyBjaGlsZEludElkOiAwIH0sXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGFzeW5jICh4bWxPYmplY3REYXRhKSA9PiB7XG4gICAgICAgICAgYXdhaXQgY29uc29sZS5sb2coeG1sT2JqZWN0RGF0YSk7XG4gICAgICAgICAgcmVzKHtcbiAgICAgICAgICAgIHN0dWRlbnQ6IHtcbiAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Gb3JtYXR0ZWROYW1lWzBdLFxuICAgICAgICAgICAgICBsYXN0TmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5MYXN0TmFtZUdvZXNCeVswXSxcbiAgICAgICAgICAgICAgbmlja25hbWU6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uTmlja05hbWVbMF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmlydGhEYXRlOiBuZXcgRGF0ZSh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkJpcnRoRGF0ZVswXSksXG4gICAgICAgICAgICB0cmFjazogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5UcmFjayksXG4gICAgICAgICAgICBhZGRyZXNzOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkFkZHJlc3MpLFxuICAgICAgICAgICAgcGhvdG86IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uUGhvdG8pLFxuICAgICAgICAgICAgY291bnNlbG9yOlxuICAgICAgICAgICAgICB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkNvdW5zZWxvck5hbWUgJiZcbiAgICAgICAgICAgICAgeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JFbWFpbCAmJlxuICAgICAgICAgICAgICB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkNvdW5zZWxvclN0YWZmR1VcbiAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JOYW1lWzBdLFxuICAgICAgICAgICAgICAgICAgICBlbWFpbDogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JFbWFpbFswXSxcbiAgICAgICAgICAgICAgICAgICAgc3RhZmZHdTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JTdGFmZkdVWzBdLFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgY3VycmVudFNjaG9vbDogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5DdXJyZW50U2Nob29sWzBdLFxuICAgICAgICAgICAgZGVudGlzdDogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5EZW50aXN0XG4gICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5EZW50aXN0WzBdWydAX05hbWUnXVswXSxcbiAgICAgICAgICAgICAgICAgIHBob25lOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkRlbnRpc3RbMF1bJ0BfUGhvbmUnXVswXSxcbiAgICAgICAgICAgICAgICAgIGV4dG46IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uRGVudGlzdFswXVsnQF9FeHRuJ11bMF0sXG4gICAgICAgICAgICAgICAgICBvZmZpY2U6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uRGVudGlzdFswXVsnQF9PZmZpY2UnXVswXSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgcGh5c2ljaWFuOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLlBoeXNpY2lhblxuICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uUGh5c2ljaWFuWzBdWydAX05hbWUnXVswXSxcbiAgICAgICAgICAgICAgICAgIHBob25lOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLlBoeXNpY2lhblswXVsnQF9QaG9uZSddWzBdLFxuICAgICAgICAgICAgICAgICAgZXh0bjogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5QaHlzaWNpYW5bMF1bJ0BfRXh0biddWzBdLFxuICAgICAgICAgICAgICAgICAgaG9zcGl0YWw6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uUGh5c2ljaWFuWzBdWydAX0hvc3BpdGFsJ11bMF0sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGlkOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLlBlcm1JRCksXG4gICAgICAgICAgICBvcmdZZWFyR3U6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uT3JnWWVhckdVKSxcbiAgICAgICAgICAgIHBob25lOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLlBob25lKSxcbiAgICAgICAgICAgIGVtYWlsOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkVNYWlsKSxcbiAgICAgICAgICAgIC8vIGVtZXJnZW5jeUNvbnRhY3RzOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkVtZXJnZW5jeUNvbnRhY3RzICYmIHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uRW1lcmdlbmN5Q29udGFjdHNbMF1cbiAgICAgICAgICAgIC8vICAgPyB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkVtZXJnZW5jeUNvbnRhY3RzWzBdLkVtZXJnZW5jeUNvbnRhY3QubWFwKChjb250YWN0KSA9PiAoe1xuICAgICAgICAgICAgLy8gICAgICAgbmFtZTogb3B0aW9uYWwoY29udGFjdFsnQF9OYW1lJ10pLFxuICAgICAgICAgICAgLy8gICAgICAgcGhvbmU6IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgaG9tZTogb3B0aW9uYWwoY29udGFjdFsnQF9Ib21lUGhvbmUnXSksXG4gICAgICAgICAgICAvLyAgICAgICAgIG1vYmlsZTogb3B0aW9uYWwoY29udGFjdFsnQF9Nb2JpbGVQaG9uZSddKSxcbiAgICAgICAgICAgIC8vICAgICAgICAgb3RoZXI6IG9wdGlvbmFsKGNvbnRhY3RbJ0BfT3RoZXJQaG9uZSddKSxcbiAgICAgICAgICAgIC8vICAgICAgICAgd29yazogb3B0aW9uYWwoY29udGFjdFsnQF9Xb3JrUGhvbmUnXSksXG4gICAgICAgICAgICAvLyAgICAgICB9LFxuICAgICAgICAgICAgLy8gICAgICAgcmVsYXRpb25zaGlwOiBvcHRpb25hbChjb250YWN0WydAX1JlbGF0aW9uc2hpcCddKSxcbiAgICAgICAgICAgIC8vICAgICB9KSlcbiAgICAgICAgICAgIC8vICAgOiBbXSxcbiAgICAgICAgICAgIGdlbmRlcjogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5HZW5kZXIpLFxuICAgICAgICAgICAgZ3JhZGU6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uR3JhZGUpLFxuICAgICAgICAgICAgbG9ja2VySW5mb1JlY29yZHM6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uTG9ja2VySW5mb1JlY29yZHMpLFxuICAgICAgICAgICAgaG9tZUxhbmd1YWdlOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkhvbWVMYW5ndWFnZSksXG4gICAgICAgICAgICBob21lUm9vbTogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Ib21lUm9vbSksXG4gICAgICAgICAgICBob21lUm9vbVRlYWNoZXI6IHtcbiAgICAgICAgICAgICAgZW1haWw6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uSG9tZVJvb21UY2hFTWFpbCksXG4gICAgICAgICAgICAgIG5hbWU6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uSG9tZVJvb21UY2gpLFxuICAgICAgICAgICAgICBzdGFmZkd1OiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkhvbWVSb29tVGNoU3RhZmZHVSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gYWRkaXRpb25hbEluZm86IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uVXNlckRlZmluZWRHcm91cEJveGVzWzBdLlVzZXJEZWZpbmVkR3JvdXBCb3hcbiAgICAgICAgICAgIC8vICAgPyAoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Vc2VyRGVmaW5lZEdyb3VwQm94ZXNbMF0uVXNlckRlZmluZWRHcm91cEJveC5tYXAoKGRlZmluZWRCb3gpID0+ICh7XG4gICAgICAgICAgICAvLyAgICAgICBpZDogb3B0aW9uYWwoZGVmaW5lZEJveFsnQF9Hcm91cEJveElEJ10pLCAvLyBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICAgICAgICAgIC8vICAgICAgIHR5cGU6IGRlZmluZWRCb3hbJ0BfR3JvdXBCb3hMYWJlbCddWzBdLCAvLyBzdHJpbmdcbiAgICAgICAgICAgIC8vICAgICAgIHZjSWQ6IG9wdGlvbmFsKGRlZmluZWRCb3hbJ0BfVkNJRCddKSwgLy8gc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICAgICAgICAvLyAgICAgICBpdGVtczogZGVmaW5lZEJveC5Vc2VyRGVmaW5lZEl0ZW1zWzBdLlVzZXJEZWZpbmVkSXRlbS5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgICAgICAvLyAgICAgICAgIHNvdXJjZToge1xuICAgICAgICAgICAgLy8gICAgICAgICAgIGVsZW1lbnQ6IGl0ZW1bJ0BfU291cmNlRWxlbWVudCddWzBdLFxuICAgICAgICAgICAgLy8gICAgICAgICAgIG9iamVjdDogaXRlbVsnQF9Tb3VyY2VPYmplY3QnXVswXSxcbiAgICAgICAgICAgIC8vICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vICAgICAgICAgdmNJZDogaXRlbVsnQF9WQ0lEJ11bMF0sXG4gICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlOiBpdGVtWydAX1ZhbHVlJ11bMF0sXG4gICAgICAgICAgICAvLyAgICAgICAgIHR5cGU6IGl0ZW1bJ0BfSXRlbVR5cGUnXVswXSxcbiAgICAgICAgICAgIC8vICAgICAgIH0pKSBhcyBBZGRpdGlvbmFsSW5mb0l0ZW1bXSxcbiAgICAgICAgICAgIC8vICAgICB9KSkgYXMgQWRkaXRpb25hbEluZm9bXSlcbiAgICAgICAgICAgIC8vICAgOiBbXSxcbiAgICAgICAgICB9IGFzIFN0dWRlbnRJbmZvKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHJlaik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZldGNoRXZlbnRzV2l0aGluSW50ZXJ2YWwoZGF0ZTogRGF0ZSkge1xuICAgIHJldHVybiBzdXBlci5wcm9jZXNzUmVxdWVzdDxDYWxlbmRhclhNTE9iamVjdD4oXG4gICAgICB7XG4gICAgICAgIG1ldGhvZE5hbWU6ICdTdHVkZW50Q2FsZW5kYXInLFxuICAgICAgICBwYXJhbVN0cjogeyBjaGlsZEludElkOiAwLCBSZXF1ZXN0RGF0ZTogZGF0ZS50b0lTT1N0cmluZygpIH0sXG4gICAgICB9LFxuICAgICAgKHhtbCkgPT4gbmV3IFhNTEZhY3RvcnkoeG1sKS5lbmNvZGVBdHRyaWJ1dGUoJ1RpdGxlJywgJ0ljb24nKS50b1N0cmluZygpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge0NhbGVuZGFyT3B0aW9uc30gb3B0aW9ucyBPcHRpb25zIHRvIHByb3ZpZGUgZm9yIGNhbGVuZGFyIG1ldGhvZC4gQW4gaW50ZXJ2YWwgaXMgcmVxdWlyZWQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPENhbGVuZGFyPn0gUmV0dXJucyBhIENhbGVuZGFyIG9iamVjdFxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogYGBganNcbiAgICogY2xpZW50LmNhbGVuZGFyKHsgaW50ZXJ2YWw6IHsgc3RhcnQ6IG5ldyBEYXRlKCc1LzEvMjAyMicpLCBlbmQ6IG5ldyBEYXRlKCc4LzEvMjAyMScpIH0sIGNvbmN1cnJlbmN5OiBudWxsIH0pOyAvLyAtPiBMaW1pdGxlc3MgY29uY3VycmVuY3kgKG5vdCByZWNvbW1lbmRlZClcbiAgICpcbiAgICogY29uc3QgY2FsZW5kYXIgPSBhd2FpdCBjbGllbnQuY2FsZW5kYXIoeyBpbnRlcnZhbDogeyAuLi4gfX0pO1xuICAgKiBjb25zb2xlLmxvZyhjYWxlbmRhcik7IC8vIC0+IHsgc2Nob29sRGF0ZTogey4uLn0sIG91dHB1dFJhbmdlOiB7Li4ufSwgZXZlbnRzOiBbLi4uXSB9XG4gICAqIGBgYFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGNhbGVuZGFyKG9wdGlvbnM6IENhbGVuZGFyT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxDYWxlbmRhcj4ge1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBDYWxlbmRhck9wdGlvbnMgPSB7XG4gICAgICBjb25jdXJyZW5jeTogNyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcbiAgICBjb25zdCBjYWwgPSBhd2FpdCBjYWNoZS5tZW1vKCgpID0+IHRoaXMuZmV0Y2hFdmVudHNXaXRoaW5JbnRlcnZhbChuZXcgRGF0ZSgpKSk7XG4gICAgY29uc3Qgc2Nob29sRW5kRGF0ZTogRGF0ZSB8IG51bWJlciA9XG4gICAgICBvcHRpb25zLmludGVydmFsPy5lbmQgPz8gbmV3IERhdGUoY2FsLkNhbGVuZGFyTGlzdGluZ1swXVsnQF9TY2hvb2xFbmREYXRlJ11bMF0pO1xuICAgIGNvbnN0IHNjaG9vbFN0YXJ0RGF0ZTogRGF0ZSB8IG51bWJlciA9XG4gICAgICBvcHRpb25zLmludGVydmFsPy5zdGFydCA/PyBuZXcgRGF0ZShjYWwuQ2FsZW5kYXJMaXN0aW5nWzBdWydAX1NjaG9vbEJlZ0RhdGUnXVswXSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICBjb25zdCBtb250aHNXaXRoaW5TY2hvb2xZZWFyID0gZWFjaE1vbnRoT2ZJbnRlcnZhbCh7IHN0YXJ0OiBzY2hvb2xTdGFydERhdGUsIGVuZDogc2Nob29sRW5kRGF0ZSB9KTtcbiAgICAgIGNvbnN0IGdldEFsbEV2ZW50c1dpdGhpblNjaG9vbFllYXIgPSAoKTogUHJvbWlzZTxDYWxlbmRhclhNTE9iamVjdFtdPiA9PlxuICAgICAgICBkZWZhdWx0T3B0aW9ucy5jb25jdXJyZW5jeSA9PSBudWxsXG4gICAgICAgICAgPyBQcm9taXNlLmFsbChtb250aHNXaXRoaW5TY2hvb2xZZWFyLm1hcCgoZGF0ZSkgPT4gdGhpcy5mZXRjaEV2ZW50c1dpdGhpbkludGVydmFsKGRhdGUpKSlcbiAgICAgICAgICA6IGFzeW5jUG9vbEFsbChkZWZhdWx0T3B0aW9ucy5jb25jdXJyZW5jeSwgbW9udGhzV2l0aGluU2Nob29sWWVhciwgKGRhdGUpID0+XG4gICAgICAgICAgICAgIHRoaXMuZmV0Y2hFdmVudHNXaXRoaW5JbnRlcnZhbChkYXRlKVxuICAgICAgICAgICAgKTtcbiAgICAgIGxldCBtZW1vOiBDYWxlbmRhciB8IG51bGwgPSBudWxsO1xuICAgICAgZ2V0QWxsRXZlbnRzV2l0aGluU2Nob29sWWVhcigpXG4gICAgICAgIC50aGVuKChldmVudHMpID0+IHtcbiAgICAgICAgICBjb25zdCBhbGxFdmVudHMgPSBldmVudHMucmVkdWNlKChwcmV2LCBldmVudHMpID0+IHtcbiAgICAgICAgICAgIGlmIChtZW1vID09IG51bGwpXG4gICAgICAgICAgICAgIG1lbW8gPSB7XG4gICAgICAgICAgICAgICAgc2Nob29sRGF0ZToge1xuICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKGV2ZW50cy5DYWxlbmRhckxpc3RpbmdbMF1bJ0BfU2Nob29sQmVnRGF0ZSddWzBdKSxcbiAgICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoZXZlbnRzLkNhbGVuZGFyTGlzdGluZ1swXVsnQF9TY2hvb2xFbmREYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3V0cHV0UmFuZ2U6IHtcbiAgICAgICAgICAgICAgICAgIHN0YXJ0OiBzY2hvb2xTdGFydERhdGUsXG4gICAgICAgICAgICAgICAgICBlbmQ6IHNjaG9vbEVuZERhdGUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcmVzdDogQ2FsZW5kYXIgPSB7XG4gICAgICAgICAgICAgIC4uLm1lbW8sIC8vIFRoaXMgaXMgdG8gcHJldmVudCByZS1pbml0aWFsaXppbmcgRGF0ZSBvYmplY3RzIGluIG9yZGVyIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgICAgZXZlbnRzOiBbXG4gICAgICAgICAgICAgICAgLi4uKHByZXYuZXZlbnRzID8gcHJldi5ldmVudHMgOiBbXSksXG4gICAgICAgICAgICAgICAgLi4uKHR5cGVvZiBldmVudHMuQ2FsZW5kYXJMaXN0aW5nWzBdLkV2ZW50TGlzdHNbMF0gIT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICA/IChldmVudHMuQ2FsZW5kYXJMaXN0aW5nWzBdLkV2ZW50TGlzdHNbMF0uRXZlbnRMaXN0Lm1hcCgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50WydAX0RheVR5cGUnXVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudFR5cGUuQVNTSUdOTUVOVDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NpZ25tZW50RXZlbnQgPSBldmVudCBhcyBBc3NpZ25tZW50RXZlbnRYTUxPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRlY29kZVVSSShhc3NpZ25tZW50RXZlbnRbJ0BfVGl0bGUnXVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkTGlua0RhdGE6IGFzc2lnbm1lbnRFdmVudFsnQF9BZGRMaW5rRGF0YSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFndTogYXNzaWdubWVudEV2ZW50WydAX0FHVSddID8gYXNzaWdubWVudEV2ZW50WydAX0FHVSddWzBdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKGFzc2lnbm1lbnRFdmVudFsnQF9EYXRlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRndTogYXNzaWdubWVudEV2ZW50WydAX0RHVSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IGFzc2lnbm1lbnRFdmVudFsnQF9MaW5rJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBhc3NpZ25tZW50RXZlbnRbJ0BfU3RhcnRUaW1lJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogRXZlbnRUeXBlLkFTU0lHTk1FTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1R5cGU6IGFzc2lnbm1lbnRFdmVudFsnQF9WaWV3VHlwZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGFzIEFzc2lnbm1lbnRFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLkhPTElEQVk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGVjb2RlVVJJKGV2ZW50WydAX1RpdGxlJ11bMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50VHlwZS5IT0xJREFZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogZXZlbnRbJ0BfU3RhcnRUaW1lJ11bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoZXZlbnRbJ0BfRGF0ZSddWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBIb2xpZGF5RXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5SRUdVTEFSOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ3VsYXJFdmVudCA9IGV2ZW50IGFzIFJlZ3VsYXJFdmVudFhNTE9iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGVjb2RlVVJJKHJlZ3VsYXJFdmVudFsnQF9UaXRsZSddWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ3U6IHJlZ3VsYXJFdmVudFsnQF9BR1UnXSA/IHJlZ3VsYXJFdmVudFsnQF9BR1UnXVswXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZShyZWd1bGFyRXZlbnRbJ0BfRGF0ZSddWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcmVndWxhckV2ZW50WydAX0V2dERlc2NyaXB0aW9uJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gcmVndWxhckV2ZW50WydAX0V2dERlc2NyaXB0aW9uJ11bMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRndTogcmVndWxhckV2ZW50WydAX0RHVSddID8gcmVndWxhckV2ZW50WydAX0RHVSddWzBdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IHJlZ3VsYXJFdmVudFsnQF9MaW5rJ10gPyByZWd1bGFyRXZlbnRbJ0BfTGluayddWzBdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogcmVndWxhckV2ZW50WydAX1N0YXJ0VGltZSddWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50VHlwZS5SRUdVTEFSLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdUeXBlOiByZWd1bGFyRXZlbnRbJ0BfVmlld1R5cGUnXSA/IHJlZ3VsYXJFdmVudFsnQF9WaWV3VHlwZSddWzBdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZExpbmtEYXRhOiByZWd1bGFyRXZlbnRbJ0BfQWRkTGlua0RhdGEnXSA/IHJlZ3VsYXJFdmVudFsnQF9BZGRMaW5rRGF0YSddWzBdIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGFzIFJlZ3VsYXJFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pIGFzIEV2ZW50W10pXG4gICAgICAgICAgICAgICAgICA6IFtdKSxcbiAgICAgICAgICAgICAgXSBhcyBFdmVudFtdLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgICAgfSwge30gYXMgQ2FsZW5kYXIpO1xuICAgICAgICAgIHJlcyh7IC4uLmFsbEV2ZW50cywgZXZlbnRzOiBfLnVuaXFCeShhbGxFdmVudHMuZXZlbnRzLCAoaXRlbSkgPT4gaXRlbS50aXRsZSkgfSBhcyBDYWxlbmRhcik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChyZWopO1xuICAgIH0pO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDZSxNQUFNQSxNQUFNLFNBQVNDLGFBQUksQ0FBQ0QsTUFBTSxDQUFDO0lBRTlDRSxXQUFXLENBQUNDLFdBQTZCLEVBQUVDLE9BQWUsRUFBRTtNQUMx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