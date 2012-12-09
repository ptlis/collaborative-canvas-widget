/*jshint jquery:true */


define( ['jquery', 'card_specific/templates/selectable_prompts', 'decks'],
        function($, SelectablePromptTemplate, decks) {
            'use strict';

            var deckData    = {

                // Deck info
                'deck'          : {
                    'title':        'Bolton Cards',
                    'description':  'Lesson planning cards from UoB.'
                },


                'cardTypes'     : {
                    'tools_bolton'      : {
                        'title'             : 'Tools (Bolton)',
                        'description'       : 'Tools that are made available by the University of Bolton.',

                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Resources'
                            },

                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Forum',
                                                            'description':  'for threaded discussions'},
                                    '1'                 : { 'title':        'Chat',
                                                            'description':  'for immediate, synchronous discussions'},
                                    '2'                 : { 'title':        'Quiz',
                                                            'description':  'simple e-assessment'},
                                    '3'                 : { 'title':        'Drop box',
                                                            'description':  'submit work with receipt'},
                                    '4'                 : { 'title':        'Journal',
                                                            'description':  'online tool for private note taking and reflection with the option to share selections with others'},
                                    '5'                 : { 'title':        'Blog',
                                                            'description':  'online authoring of content'},
                                    '6'                 : { 'title':        'Notice board',
                                                            'description':  'to disseminate information'},
                                    '7'                 : { 'title':        'Calendar',
                                                            'description':  'for key activities and dates'},
                                    '8'                 : { 'title':        'Tools for sharing resources',
                                                            'description':  'upload files, create web pages, share links'},
                                    '9'                 : { 'title':        'Survey tools',
                                                            'description':  'to gather data for analysis'},
                                    '10'                : { 'title':        'Wiki',
                                                            'description':  'for collaborative authoring'},
                                    '11'                : { 'title':        'Aggregation',
                                                            'description':  'pull together and filter web content from blogs, wiki and websites'},
                                    '12'                : { 'title':        'Library online resources',
                                                            'description':  'a wide range of e-books, journals, databases, etc.'},
                                    '13'                : { 'title':        'Turn-it-in',
                                                            'description':  'submission of work and support for responsible academic writing'},
                                    '14'                : { 'title':        'e-Portfolio (Mahara)',
                                                            'description':  'collation of and reflection on resources and activities'},
                                    '15'                : { 'title':        'other',
                                                            'description':  'A resource other than those listed.'}
                                }
                            }
                        }
                    },

                    'tools_online'      : {
                        'title'             : 'Tools (Web)',
                        'description'       : 'General tools that are available online.',

                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Online Resources'
                            },

                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Flickr',
                                                            'description':  'online sharing of photographs'},
                                    '1'                 : { 'title':        'Google maps',
                                                            'description':  'online tools to interrogate world-wide geography'},
                                    '2'                 : { 'title':        'Google docs',
                                                            'description':  'for collaborative creation of spreadsheets, presentations and text documents'},
                                    '3'                 : { 'title':        'Skype',
                                                            'description':  'over the web conversations and text chat'},
                                    '4'                 : { 'title':        'YouTube',
                                                            'description':  'share videos and discuss them'},
                                    '5'                 : { 'title':        'Learning objects',
                                                            'description':  'commercially produced, stand alone, integrative resources'},
                                    '6'                 : { 'title':        'Repository',
                                                            'description':  'online collections including data sets, historical artifacts, etc.'},
                                    '7'                 : { 'title':        'Search engines',
                                                            'description':  'find your own resources!'},
                                    '8'                 : { 'title':        'Widgets',
                                                            'description':  'a way of adding a wide range of resources to existing platforms - mostly just round the corner!'},
                                    '9'                 : { 'title':        'Dropbox',
                                                            'description':  'for online sharing files between individuals and groups'},
                                    '10'                : { 'title':        'other',
                                                            'description':  'A resource other than those listed.'}
                                }
                            }
                        }
                    },

                    'roles'     : {
                        'title'             : 'Learning Roles',
                        'description'       : 'Types of roles that students and teachers fulfil within a learning environemnt.',

                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Roles'
                            },

                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Learning facilitator',
                                                            'description':  'works in a supportive role to guide learning activities to meet the learners’ objectives'},
                                    '1'                 : { 'title':        'Researcher',
                                                            'description':  'plans and undertakes systematic inquiries to find things out'},
                                    '2'                 : { 'title':        'Co-learner',
                                                            'description':  'reciprocal sharing and developing of knowledge from a position of recognition of the value'},
                                    '3'                 : { 'title':        'Coach',
                                                            'description':  'works to help someone identify areas to work on and set academic goals to achieve'},
                                    '4'                 : { 'title':        'Expert',
                                                            'description':  'offers subject, discipline or domain specific knowledge in response to questions'},
                                    '5'                 : { 'title':        'Lecturer',
                                                            'description':  'presents information to teach about a particular topic'},
                                    '6'                 : { 'title':        'Demonstrator',
                                                            'description':  'shows how to perform a particular activity'},
                                    '7'                 : { 'title':        'Modelling',
                                                            'description':  'through interactions and behaviour demonstrates how to perform in a particular role'},
                                    '8'                 : { 'title':        'other',
                                                            'description':  'A role other than those listed.'}
                                }
                            }
                        }
                    },

                    'online_activities'     : {
                        'title'             : 'Learning Activities',
                        'description'       : 'Activities for students within a learning environment',

                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Activities'
                            },

                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Hotseat',
                                                            'description':  'ask an expert questions in an online conversation'},
                                    '1'                 : { 'title':        'Purposeful discussion',
                                                            'description':  'learners address a particular theme or topic, facilitated by a teacher or self-managed'},
                                    '2'                 : { 'title':        'Learning set',
                                                            'description':  'small groups of learners support each other offering critical feedback on selected items'},
                                    '3'                 : { 'title':        'Inquiry project',
                                                            'description':  'learners identify through negotiation an inquiry into a topic'},
                                    '4'                 : { 'title':        'Negotiation of a learning contract',
                                                            'description':  'an agreement between the learners and teacher to undertake a set of negotiated activities'},
                                    '5'                 : { 'title':        'Field trip',
                                                            'description':  'learners are briefed about an online site with instructions about what to look out for and bring back their observations to share with others'},
                                    '6'                 : { 'title':        'Purposeful individual activities',
                                                            'description':  'access an online resource, learning object, repository, journal, etc.'},
                                    '7'                 : { 'title':        'Jigsaw',
                                                            'description':  'learners follow instructions to undertake one part of an overall learning activity and then share their work with each other'},
                                    '8'                 : { 'title':        'Formative assessment',
                                                            'description':  'opportunities for evaluative feedback from other learners and teachers'},
                                    '9'                 : { 'title':        'Summative assessment',
                                                            'description':  'submission of a final piece for assessment'},
                                    '10'                : { 'title':        'Summarising',
                                                            'description':  'learners or teachers pull together a conversation identifying key points of agreement, disagreement or questions'},
                                    '11'                : { 'title':        'Serious games!',
                                                            'description':  'learners play a game with an intended learning purpose'},
                                    '12'                : { 'title':        'Ice breaking',
                                                            'description':  'low stakes, accessible activities to get learners to know each other'},
                                    '13'                : { 'title':        'Debate',
                                                            'description':  'focused discussion with identified roles and positions'},
                                    '14'                : { 'title':        'Brainstorm',
                                                            'description':  'anything goes sharing of initial ideas'},
                                    '15'                : { 'title':        'Role play',
                                                            'description':  'learners adopt different roles for discussion or other activity'},
                                    '16'                : { 'title':        'Practice critical thinking skills',
                                                            'description':  'opportunity for reflection, evaluation and synthesis'},
                                    '17'                : { 'title':        'other',
                                                            'description':  'An activity other than those listed.'}
                                }
                            }
                        }
                    }
                }
            };

            decks.addHandler('ld', new SelectablePromptTemplate('ld', deckData));
        }
);
