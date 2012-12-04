/*jshint jquery:true */


define( ['jquery', 'card_specific/templates/selectable_prompts', 'cards'],
        function($, SelectablePromptTemplate, cards) {
            'use strict';
        
            var deckData    = {
                    
                // Deck info
                'deck'          : {
                    'title':        'Assessment Deck',
                    'description':  'These cards aim to help staff redesign their formative assessment and feedback practice in innovative ways that will allow learners to develop the ability to self-regulate their own learning and therefore improve the quality of their learning experience.'
                },
        
        
                'cardTypes'    : {
                    'clarify'       : {
                        'title'             : 'Clarify Good Performance',
                        'description'       : 'To what extent do learners have opportunities to engage actively with goals, criteria and standards, before, during and after an assessment task?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help clarify what good performance is (goals, criteria, standards)'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Provide clear definitions of academic requirements before each learning task.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Provide explicit marking criteria and performance-level definitions.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Provide opportunities for discussion and reflection about criteria and standards before learners engage in a learning task.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Ask learners to reformulate in their own words the documented criteria before they begin the task. This could be submitted with the assessment.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Model in class how you would think through and solve exemplar problems.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Provide learners with model answers for assessment tasks and opportunities to make comparisons against their own work.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Explain to learners the rationale of assessment and feedback techniques.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Before an assessment, let learners examine selected examples of completed assessments to identify which are superior and why (individually or in groups).',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Organise a workshop where learners devise, in collaboration with you, some of their own assessment criteria for a piece of work.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Ask learners to add their own specific criteria to the general criteria provided by you.',
                                                            'description':  ''},
                                    '10'                : { 'title':        'Work with your learners to develop an agreement, contract or charter where roles and responsibilities in assessment and learning are defined.',
                                                            'description':  ''},
                                    '11'                : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'encourage'     : {
                        'title'             : 'Encourage Time and Effort on Task',
                        'description'       : 'To what extent do your assessment tasks encourage regular study in and out of class and deep rather than surface learning?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Encourage "time and effort" on challenging learning tasks'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Reduce the size (e.g. by limiting the word count) and increase the number of learning tasks (or assessments). Distribute these across the module.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Make such tasks compulsory and/or carry minimal mark',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Break up large assessment into smaller parts, Monitor performance and provide feedback in a staged way over the timeline of your module.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Empower learners by asking them to draw up their own work plan for a complex learning task. Let them define their own milestones and deliverables before they begin. Assign some marks if they deliver as planned and on time.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Provide homework activities that build on/link in-class activities to out-of-class activities.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Ask learners to present and work through their solutions in class supported by peer comments.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Align learning tasks tso that students have opportunities to practise the skills required before the work is marked.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Give learners online multiple-choice tests to do before class and then focus the class teaching on areas of identified weakness based on the results of these tests.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Use a "patchwork text" - a series of small, distributed, written assignments of different types. Each of these are complete in themselves but can also be "stitched together" through a final integrative commentary.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Award fewer marks for early assessments or allocate all marks for final synthesis. This format Gives learners some choice by allowing them to select which patches to include in final reflective account.',
                                                            'description':  ''},
                                    '10'                : { 'title':        'Have learners undertake regular small summative tasks that carry minimal marks, with regular feedback.',
                                                            'description':  ''},
                                    '11'                : { 'title':        'Provide learners with mock exams so they have opportunities to experience what is required for summative assessment in a safe environment.',
                                                            'description':  ''},
                                    '12'                : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'deliver'       : {
                        'title'             : 'Deliver High Quality Feedback',
                        'description'       : 'What kind of teacher feedback do you provide - in what ways does it help learners self-assess and self-correct?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Deliver high quality feedback'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Provide opportunities for your learners to work through problem sets in tutorials, where feedback from you is available. This ensures that the feedback is timely and is received when learners get \'stuck\'.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Ensure feedback turnaround time is prompt, ideally within two weeks.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Give plenty of documented feedback in advance of learners attempting an assessment, e.g. a \'frequently occurring problems\' list.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Give plenty of feedback to learners at the point at which they submit their work for assessment. This feedback might include a handout outlining suggestions in relation to known difficulties shown by previous learner cohorts supplemented by in-class explanations. Learners are most receptive for feedback when they have just worked through their assessment.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Ensure that feedback is provided in relation to previously stated criteria, as this helps to link feedback to the expected learning outcomes.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Limit the number of criteria for complex tasks; especially extended writing tasks, where good performance is not just ticking off each criterion but is more about producing a holistic response.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Instead of providing the correct answer, point learners to where they can find the correct answer.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Ask learners to attach three questions that they would like to know about an assessment, or what aspects they would like to improve.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Ask learners to self-assess their own work before submission and provide feedback on this self-assessment as well as on the assessment itself.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'provide'       : {
                        'title'             : 'Provide Opportunities to act on Feedback',
                        'description'       : 'To what extent is feedback attended to and acted upon by learners, and if so, in what ways?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Provide opportunities to act on feedback'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Increase the number of opportunities for resubmission of assessments.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Model the strategies that might be used to deal with difficulties with learners work in class.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Avoid releasing the grade for an assessment until the learner has responded to feedback by commenting on it.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Write down some action points alongside the normal feedback you provide. This would identify for learners what they should do next time to improve their performance.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Ask learners to find one or two examples of feedback comments that they found useful and explain how these might help them with future assessments.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Use teaching time to involve learners in identifying action points for future assessments. Learners could formulate these action points after having read the feedback comments they have received.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Provide online tasks where feedback is integrated into the task.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Provide learners with model answers for assessment tasks and opportunities for them to make comparisons against their own work.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'dialogue'      : {
                        'title'             : 'Encourage Interaction and Dialogue',
                        'description'       : 'What opportunities are there for feedback dialogue (peer and/or teacher-learner) around assessment tasks in your course?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Encourage interaction and dialogue'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Review feedback in tutorials. Ask learners to read the written feedback comments on an assessment and discuss this with peers.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Encourage learners to give each other feedback on an assessment in relation to published criteria before submission.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Create natural peer dialogue by group projects. Structure tasks so that learners are encouraged to discuss the criteria and standards expected beforehand, and return to discuss progress in relation to the criteria during the project.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Use learner response systems to make lectures more interactive.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Facilitate teacher-learner feedback in class through the use of in-class feedback techniques.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Ask learners to answer short questions on paper at end of class. Use the results to provide feedback and stimulate discussion at the next class.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Support the development of learning groups and learning communities.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Construct groupwork to help learners to make connections.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Ask learners to set tasks for each other.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Encourage the formation of peer study groups or create opportunities for learners from later years to support or mentor learners in earlier years.',
                                                            'description':  ''},
                                    '10'                : { 'title':        'Link modules together as a pathway so that the same learners work in the same groups across a number of modules.',
                                                            'description':  ''},
                                    '11'                : { 'title':        'Require learners in groups to generate the criteria used to assess their projects.',
                                                            'description':  ''},
                                    '12'                : { 'title':        'Ask learners, in pairs, to produce multiple-choice tests, with feedback for the correct and incorrect answers.',
                                                            'description':  ''},
                                    '13'                : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'develop'       : {
                        'title'             : 'Develop Self-assessment and Reflection',
                        'description'       : 'To what extent are there formal opportunities for reflection, self-assessment or peer assessment in your course?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Develop self-assessment and reflection'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Create a series of online objective tests and quizzes that learners can use to assess their own understanding of a topic or area of study.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Ask learners to request the kind of feedback that they would like when they hand in their work.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Structure opportunities for peers to assess and provide feedback on each other\'s work using set criteria.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Use confidence-based marking (CBM). Learners must rate their confidence that their answer is correct. The higher the confidence the higher the penalty if the answer is wrong.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Use an assessment cover sheet with questions to encourage reflection and self-assessment. Ask learners to make a judgement about whether they have met the stated criteria and estimate the mark they expect.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Directly involve learners in monitoring and reflecting on their own learning, through portfolios.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Ask learners to write a reflective essay or keep a reflective journal in relation to their learning.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Help learners to understand and record their own learning achievements through portfolios. Encourage learners to link these achievements to the knowledge, skills and attitudes required in future employment.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Ask learners, in pairs, to produce multiple-choice tests over the duration of the module, with feedback for the correct and incorrect answers.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'choice'        : {
                        'title'             : 'Give Assessment Choice',
                        'description'       : 'To what extent do learners have choice in the topics, methods, criteria, weighting and/or timing of assessment tasks in your course?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Give assessment choice'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Give learners opportunities to select the topics for extended essays or project work, encouraging ownership and increasing motivation.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Give learners choice in timing with regard to when they hand in assessments - managing learner and teacher workloads. Particularly appropriate where students have many assignments and the timings for submissions can be negotiated.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Require learner groups to generate the criteria that could be used to assess their projects.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Ask learners to add their own specific criteria to the general criteria provided by the teacher. Take those into account in the final assessment.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Ask learners, in pairs, to produce multiple-choice tests with feedback for correct and incorrect answers, which reference the learning objectives. Let the rest of the class take the tests and evaluate them. These could be used in the final assessment.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'beliefs'       : {
                        'title'             : 'Encourage Positive Motivational Beliefs',
                        'description'       : 'To what exten do your assessments and feedback proceesses activate your learners\' motivation to learn and be successful?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Encourage positive motivational beliefs'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Structure learning tasks so that they have a progressive level of difficulty.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Align learning tasks so that learners have opportunities to practice skills before work is marked (summatively assessed).',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Encourage a climate of mutual respect and accountability.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Provide objective tests where learners individually assess their understanding adn make comparisons against their own learning goals, rather than against the performance of other learners.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Use real-life scenarios and dynamic feedback.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Avoid releasing marks on written work until after learners have responded to feedback comments',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Redesign and align formative and summative assessments to enhance learner skills and independence.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Adjust assessment to develop learner\'s responsibility for their learning.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Give learners opportunities to select the topics for extended essays or project work.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Provide learners with some choice in timing with regard to when they hand in assessments.',
                                                            'description':  ''},
                                    '10'                : { 'title':        'Involve learners in decision-making about assessment policy and practice.',
                                                            'description':  ''},
                                    '11'                : { 'title':        'Provide lots of opportunities for self-assessment.',
                                                            'description':  ''},
                                    '12'                : { 'title':        'Encourage the formation of supportive learning environments.',
                                                            'description':  ''},
                                    '13'                : { 'title':        'Have learner representation on committees that discuss assessment policies and practices.',
                                                            'description':  ''},
                                    '14'                : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
        
                    'inform'        : {
                        'title'             : 'Inform and Shape your Teaching',
                        'description'       : 'To what extent do your assessments and feedback processes inform and shape your teaching?',
        
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Inform and shape your teaching'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Request feedback from one-minute papers where learners carry out a small assessment task and hand it in anonymously at the end of a class. Use the information from these to inform teaching in the next class.',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Have students request the feedback they would like when they make an assignment submission.',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Provide opportunities for frequent low-stakes assessment tasks with regular outputs to help you gauge progress.',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Deliver online multiple-choice tests before a class. Analyse and use the information gathered from these to determine what is taught in class.',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Use online tools with built-in functionality for individual recording and reporting - providing information about levels of learner engagement with resources, online tests and discussions.',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Use learner response systems to provide dynamic feedback in class. The stored data provides information about responses, which could be analysed.',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Provide opportunities for learners to self-assess and reflect on their learning. A record of these reflections provides information about the learners ability to evaluate their own learning.',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Request feedback from learners on their assessment experiences in order to make improvements.',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Carry out a brief survey mid-term or mid-semester while there is time to address major concerns.',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    }
                }
        
            };
        
            cards.addDeckHandler('assessment', new SelectablePromptTemplate('assessment', deckData));
        }
);
