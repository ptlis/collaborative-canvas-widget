/*jshint jquery:true */


define( ['jquery', 'card_specific/templates/selectable_prompts', 'cards'],
        function($, SelectablePromptTemplate, cards) {
            'use strict';
            
            var deckData    = {

                // Deck info
                'deck'          : {
                    'title':        'Information Skills Deck',
                    'description':  'These cards aim to help staff consider their information skills strategy, think about how the information skills load is spread throughout the course, and help learners develop the necessary information skills for their studies.'
                },
            
            
                'cardTypes'    : {
                    'identify'      : {
                        'title'             : 'Identify: Define a Task and Understand the Topic',
                        'description'       : 'Help learners to identify their personal need for information and define their search topic/question using simple terms.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to',
                                '1'                 : 'Help learners to gather background information to gain understanding of their topic, such as'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Define their task in their own words, and check that they know what information they need to find out to complete the task',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Take personal responsibility for an information search and manage their time effectively',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Understand the need for accurate, current and relevant information',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Recognise and avoid the problems of \'information overload\' and encourage learners to define limits of their search for their particular information needs',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Understand how their information search might change as they discover more material, e.g. an information source might lead them to a new area of research',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Material sourced via University library catalogue',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'News sources (print or online)',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Government information',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Quality online sources – e.g. e-journals, e-books',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Other forms of media – e.g. blogs, podcasts, audio, video sources',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Academic papers/research',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Dictionaries/encyclopedias',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Directories - people/organisations',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
            
                    'scope'     : {
                        'title'             : 'Scope: Select Appropriate Resources',
                        'description'       : 'Help Learners to assess their current knowledge of a topic and seek different ways of addressing their infformation gaps.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to recognise different types of valid information resources',
                                '1'                 : 'Help learners to recognise different formats of information sources',
                                '2'                 : 'Help learners to'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Scholarly/quality resources available from the library',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Other respected resources, such as news websites (e.g. BBC News)',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'Primary information sources',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Secondary information sources',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Print sources',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Online Resources',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Journal Literature',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Other',
                                                            'description':  ''}
                                },
                                '2'                 : {
                                    '0'                 : { 'title':        'Use new tools for searching as they become available',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Identify appropriate resources by providing them with subject-specific information skills session with library staff - organise this with the subject librarian',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Select appropriate information to meed their specific needs',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
            
                    'plan'      : {
                        'title'             : 'Plan: Search Effectively',
                        'description'       : 'Help learners to develop the right skills to do their research and find the necessary information.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to',
                                '1'                 : 'Help learners to understand how to pick the right search tool(s) for their needs'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Scope their search questions clearly, using appropriate language',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Develop and practice advanced search techniques as necessary (e.g. Boolean searching, wildcards) via a library information skills session',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Locate the library website, and recognise that it links to a variety of information sources, both internal and external',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Search using keywords in the library catalogue, online search engines and databases',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Use abstractions/indexes to find information, as well as full text online or print sources of information',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Be aware that standard search engines (e.g. Google, Yahoo) might not return the most relevant information, and may provide dubious or less relevant results',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Other',
                                                            'description':  ''}
                                },
                                '1'                 : {
                                    '0'                 : { 'title':        'The library catalogue',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Search engines/online databases',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'E-journals/e-books',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Specific scholarly search facilities - e.g. Google Scholar',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Online groups and forums',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
            
                    'gather'        : {
                        'title'             : 'Gather: Find and Extract Information and Data',
                        'description'       : 'Help learners to develop the right skills to do their research and find necessary information.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Use the library catalogue to search for specific books or journals available at the University',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Understand loan periods and entitlements',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Understand how print materials are organised/classified in the library',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Use the inter-campus loan service, or browse other libraries for inter-library loans',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Limit searches to certain parameters (e.g. date or format)',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Construct complex searches appropriate to different digital/print resources to find material',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Access full text information, both print and digital, read and download online materials',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Use online and printed help and find personal, expert help',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
            
                    'evaluate'      : {
                        'title'             : 'Evaluate: Compare and Analyse Information',
                        'description'       : 'Help learners to compare and evaluate information from different sources.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Recognise how information that they gather can have a particular bias',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Select and evaluate a wide range of materials on a topic and consider whether the information is current/relevant to their original search query',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Extract material by note-making/printing from online sources (bearing in mind copyright restrictions)',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Understand how to read critically, summarising key points and arguments in their own words',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Analyse and interpret information for use in a range of different context, such as essays, assignments or projects',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Assess the quality, accuracy, relevance, bias and credibility of the information resources found',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
            
                    'manage'        : {
                        'title'             : 'Manage: Organise and Share Information Ethically',
                        'description'       : 'Help learners to understand important ethical and legal issues around using and referencing published material.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Understand a relevant referencing system (e.g. Harvard)',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Know how to reference all types of information sources (print or online)',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Understand reference types, e.g. book/journal/website, or legal referencing',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Cite printed/online sources in a reference list and in-text',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Create a bibliography of their research material using different types of sources (e.g. books, journals, web pages, blogs, academic papers etc.)',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Know how to use university software (e.g. Refworks) or online reference builders (e.g. Zotero) to manage references if necessary',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Understand and access copyright, plagiarism and IPR rules and sanctions that apply to their university, and meet standards of conduct for academic integrity',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Understand academics\' use of online plagiarism software (e.g. Turnitin)',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Understand how to keep records of resources that have been used - e.g. resource from database',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    },
            
                    'present'       : {
                        'title'             : 'Present: Interpret information and create new content',
                        'description'       : 'Help learners to analyse all the information they have extracted and produce a synthesis that presents their own perspective and findings.',
            
                        'details'           : {
                            'headings'          : {
                                '0'                 : 'Help learners to'
                            },
                            'items'             : {
                                '0'                 : {
                                    '0'                 : { 'title':        'Think critically about what they have read and synthesise information',
                                                            'description':  ''},
                                    '1'                 : { 'title':        'Understand the difference between summarising and synthesising',
                                                            'description':  ''},
                                    '2'                 : { 'title':        'Develop and evidence their own ideas and opinions in a topic, rather than just regurgitating information',
                                                            'description':  ''},
                                    '3'                 : { 'title':        'Reconsider opinions as the research progresses through the discovery of new information',
                                                            'description':  ''},
                                    '4'                 : { 'title':        'Create new knowledge which builds on existing information',
                                                            'description':  ''},
                                    '5'                 : { 'title':        'Reflect on challenges faced during their study/research',
                                                            'description':  ''},
                                    '6'                 : { 'title':        'Exchange, discuss and debate information using appropriate personal networks and digital technologies (e.g. discussion lists, social networking sites, forums, blogs etc.)',
                                                            'description':  ''},
                                    '7'                 : { 'title':        'Make use of academic feedback provided by staff in all submitted work',
                                                            'description':  ''},
                                    '8'                 : { 'title':        'Keep a reflective log of their research',
                                                            'description':  ''},
                                    '9'                 : { 'title':        'Other',
                                                            'description':  ''}
                                }
                            }
                        }
                    }
                }
            };
            
            cards.addDeckHandler('information_skills', new SelectablePromptTemplate('information_skills', deckData));
        }
);
