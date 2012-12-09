/*jshint jquery:true */


define( ['jquery', 'card_specific/templates/selectable_prompts', 'decks'],
        function($, SelectablePromptTemplate, decks) {
            'use strict';
        
            var deckData    = {
        
                // Deck info
                'deck'          : {
                    'title':        'Learner Engagement Deck',
                    'description':  'These cards are based on the 8 Learning Events Model (8LEM) developed by LabSET, University of Liège, Belgium. The 8LEM specifies eight interactional concepts or learning events providing a closed list of activity options that focus on the aducational activity of the learner.'
                },
        
        
                'cardTypes'    : {
                    'receives'      : {
                        'title'             : 'Receives',
                        'description'       : 'Traditional didactic transmission of information: lecture / content delivery / recommended reading.',
                        'subtitle'          : '<em>Transmission / Reception</em>',
                        'goals'             : 'Lectures, content delivery, recommended reading',
        
                        'details'           : {
                            'description'       : 'Select the resoure type(s) that may be used and possible supporting technologies:',
                            'headings'          : {
                                '0'                 : 'Resource Types',
                                '1'                 : 'Suggested Tools & Technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Course / Lecture / Presentation notes',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Video / Audio',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Reading List',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Textbook',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Lesson Plan',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Project Outline',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Study Guide',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Glossary',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Curriculum / Syllabus',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Activity / Exercise / Fieldwork notes',
                                                            'description':  ''},
                                    '10'                : { 'title':        'Case Study',
                                                            'description':  ''},
                                    '11'                : { 'title':        'Demonstration',
                                                            'description':  ''},
                                    '12'                : { 'title':        'Worked Example',
                                                            'description':  ''},
                                    '13'                : { 'title':        'Multimedia Resource (including web pages)',
                                                            'description':  ''},
                                    '14'                : { 'title':        'Resource Pack',
                                                            'description':  ''},
                                    '15'                : { 'title':        'other',
                                                            'description':  ''}
        
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Virtual Learning Environment (VLE)',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Web pages / Websites',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Presentation tools (eg. Powerpoint)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Podcasts',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Videos',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Animations',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Screencards',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'E-Books / E-Journals',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Online Resource Listing',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Lecture Capture',
                                                            'description':  ''},
                                    '10'                : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'explores'      : {
                        'title'             : 'Explores',
                        'description'       : 'Personal exploration by learner e.g. literature reviews, Internet searches, information handling.',
                        'subtitle'          : '<em>Documentation / Exploration</em> (Searching)',
                        'goals'             : 'Internet searches, information handling, literature review',
        
                        'details'           : {
                            'description'       : 'Task(s):',
                            'headings'          : {
                                '0'                 : 'Who the learner might interact with',
                                '1'                 : 'Types of feedback / assessment',
                                '2'                 : 'Suggested tools and technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Peer ↔ Peer',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Peer ↔ Tutor',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Formal (e.g. online discussion)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Informal (e.g. outside class)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Face to face',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Self Only',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Formal',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Informal',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Peer',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Tutor',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Employer',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assessed',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Not Assessed',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Self-assessed',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Electronic Library Services',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'E-journals',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'E-books',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Online databases',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Search Engines',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Blogs',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Wikis',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Discussion tools',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Audience response tools',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'RSS feeds / mailing lists',
                                                            'description':  ''},
                                    '10'                : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'practices'     : {
                        'title'             : 'Practices',
                        'description'       : 'Application of theory and its assessment, to include teacher feedback - e.g. Exam, quiz, exercises, work based learning, etc.',
                        'subtitle'          : '<em>Guidance</em> (Coaching) <em>/ Drilling</em> (Excerising)',
                        'goals'             : 'Excersises, exams, quizzes',
        
                        'details'           : {
                            'description'       : 'Task(s):',
                            'headings'          : {
                                '0'                 : 'Who the learner might interact with',
                                '1'                 : 'Types of feedback / assessment',
                                '2'                 : 'Suggested tools and technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Peer ↔ Peer',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Peer ↔ Tutor',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Formal (e.g. online discussion)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Informal (e.g. outside class)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Face to face',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Self Only',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Formal',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Informal',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Peer',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Tutor',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Employer',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assessed',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Not Assessed',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Self-assessed',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Assessment tools (e.g. VLE Quiz and Survey Tools)',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Computer-based assessment toools (e.g. Respondus, StudyMate)',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Communication tools(e.g. VLE Chat / Discussion tools, Voice tools)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Audience response tools',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Virtual Worlds',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Simulations',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Educational games',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Portfolios',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'imitates'      : {
                        'title'             : 'Imitates',
                        'description'       : 'Learning from observation & imitation e.g. where the teacher models techniques, modeling / simulation, practicals, walk through teacherials, role plays.',
                        'subtitle'          : '<em>Modelling / Imitation</em> (Observation)',
                        'goals'             : 'Demonstrations, role-plays',
        
                        'details'           : {
                            'description'       : 'Task(s):',
                            'headings'          : {
                                '0'                 : 'Who the learner might interact with',
                                '1'                 : 'Types of feedback / assessment',
                                '2'                 : 'Suggested tools and technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Peer ↔ Peer',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Peer ↔ Tutor',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Formal (e.g. online discussion)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Informal (e.g. outside class)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Face to face',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Self Only',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Formal',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Informal',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Peer',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Tutor',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Employer',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assessed',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Not Assessed',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Self-assessed',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Videos',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Educational games',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Presentation tools (e.g. Powerpoint)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Screencasts',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Animations',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Simulations',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Virtual worlds',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Voice tools (e.g. Wimba)',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'creates'       : {
                        'title'             : 'Creates',
                        'description'       : 'Creating something new, producing work e.g. essays, projects, etc.',
                        'subtitle'          : '<em>Support</em> (Encourage) <em>/ Creation</em>',
                        'goals'             : 'Essays, projects',
        
                        'details'           : {
                            'description'       : 'Task(s):',
                            'headings'          : {
                                '0'                 : 'Who the learner might interact with',
                                '1'                 : 'Types of feedback / assessment',
                                '2'                 : 'Suggested tools and technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Peer ↔ Peer',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Peer ↔ Tutor',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Formal (e.g. online discussion)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Informal (e.g. outside class)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Face to face',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Self Only',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Formal',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Informal',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Peer',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Tutor',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Employer',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assessed',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Not Assessed',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Self-assessed',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Presentation tools (e.g. PowerPoint)',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Plagiarism detectors (e.g. Turnitin)',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Portfolios',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Assessment tools (VLE)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Word processing programs',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Image editing programs (e.g. Photoshop, Illustrator)',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Digital Media (e.g. YouTube, web pages)',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Spreadsheets',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Databases',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Blogs',
                                                            'description':  ''},
                                    '10'                : { 'title':        'Wikis',
                                                            'description':  ''},
                                    '11'                : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'experiments'   : {
                        'title'             : 'Experiments',
                        'description'       : 'Learner manipulating the environment to test personal hypotheses e.g. lab work, workshops, computer simulations, problem solving.',
                        'subtitle'          : '<em>Reactivity / Experimentation</em> (Simulation, Testing, Transformation)',
                        'goals'             : 'Practicals, workshops, problem solving',
        
                        'details'           : {
                            'description'       : 'Task(s):',
                            'headings'          : {
                                '0'                 : 'Who the learner might interact with',
                                '1'                 : 'Types of feedback / assessment',
                                '2'                 : 'Suggested tools and technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Peer ↔ Peer',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Peer ↔ Tutor',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Formal (e.g. online discussion)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Informal (e.g. outside class)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Face to face',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Self Only',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Formal',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Informal',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Peer',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Tutor',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Employer',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assessed',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Not Assessed',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Self-assessed',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Simulations',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Educational games',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Virtual worlds',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Videos',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Journal tool',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Communication tools (e.g. VLE Discussion tools / voice tools / blogs',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Statistical analysis software (e.g. SPSS, PASW)',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'debates'       : {
                        'title'             : 'Debates',
                        'description'       : 'Learning through social interactions, collaborative, challenging discussions e.g. f2f debates, online discussions.',
                        'subtitle'          : '<em>Moderation / Debage</em> (Discussion, Dialogue)',
                        'goals'             : 'Group discussions, online discussions',
        
                        'details'           : {
                            'description'       : 'Task(s):',
                            'headings'          : {
                                '0'                 : 'Who the learner might interact with',
                                '1'                 : 'Types of feedback / assessment',
                                '2'                 : 'Suggested tools and technologies'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Peer ↔ Peer',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Peer ↔ Tutor',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Formal (e.g. online discussion)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Informal (e.g. outside class)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Face to face',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Formal',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Informal',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Peer',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Tutor',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Employer',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assessed',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Not Assessed',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Self-assessed',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Discussion tools (VLE)',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Chat tools (VLE)',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Instant messaging',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Social Networking',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Blogs',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Microblogs (e.g. Twitter)',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Wikis',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Audience Response Tools',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Voice Tools (e.g. Wimba)',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'meta'          : {
                        'title'             : 'Meta-Learns',
                        'description'       : 'Self reflection at the end of a learning process.',
                        'subtitle'          : '<em>Coreflection / Metareflection</em> (Metacognition)',
                        'goals'             : 'Self reflection, self-analysis',
        
                        'details'           : {
                            'description'       : 'Select key example(s) of learner reflection that you would like to promote / encourage and consider how to enhance reflective practice.',
                            'headings'          : {
                                '0'                 : 'How to promote learner reflection',
                                '1'                 : 'How to enhance reflective practice'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Identify aims and learning outcomes',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Clarify assessment objectives',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Identify learners\' current knowledge and gaps in knowledge',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Get learners to understand their learning achievements and areas in need of improvement (e.g. confidence in achievement of learner aims; learner\'s motivation)',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Directly involve learners in monitoring and reflecting on their own learning',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Let learners consider what constitutes useful feedback. Get them to request preferred feedback.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Encourage learners to engage in critical reflection / self-regulation. Get learners to talk about and take ownership of learning',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Explore systems an dprocesses at your institution (e.g. Personal Development Planning (PDP), reflective portfolios)',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Use technology to help learners reflect, e.g. blogs, wikis, social networks',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Identify your current learner\'s reflective skills and review lessons learnt from previous cohorts',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Create learning designs that challenge',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Provide environments that promote interaction and opportunities to facilitate reflection during or after class',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Link learning aims / goals to graduate attributes / employability skills',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'other',
                                                            'description':  ''}
                                }
                            }
                        }
                    }
                }
            };
        
            decks.addHandler('hlm', new SelectablePromptTemplate('hlm', deckData));
        }
);
