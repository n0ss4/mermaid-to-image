export interface Template {
  name: string;
  category: string;
  code: string;
}

export const TEMPLATES: Template[] = [
  {
    name: "Flowchart",
    category: "Basic",
    code: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Process A]
  B -->|No| D[Process B]
  C --> E[End]
  D --> E`,
  },
  {
    name: "Sequence",
    category: "Basic",
    code: `sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello Bob
  Bob-->>Alice: Hi Alice
  Alice->>Bob: How are you?
  Bob-->>Alice: Great!`,
  },
  {
    name: "Class Diagram",
    category: "Basic",
    code: `classDiagram
  class Animal {
    +String name
    +int age
    +makeSound()
  }
  class Dog {
    +fetch()
  }
  class Cat {
    +purr()
  }
  Animal <|-- Dog
  Animal <|-- Cat`,
  },
  {
    name: "ER Diagram",
    category: "Data",
    code: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER {
    string name
    string email
  }
  ORDER {
    int id
    date created
  }
  LINE-ITEM {
    string product
    int quantity
  }`,
  },
  {
    name: "State Diagram",
    category: "Basic",
    code: `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading : fetch
  Loading --> Success : resolve
  Loading --> Error : reject
  Error --> Loading : retry
  Success --> [*]`,
  },
  {
    name: "Pie Chart",
    category: "Data",
    code: `pie title Browser Market Share
  "Chrome" : 65
  "Safari" : 19
  "Firefox" : 4
  "Edge" : 4
  "Other" : 8`,
  },
  {
    name: "Gantt Chart",
    category: "Project",
    code: `gantt
  title Sprint Plan
  dateFormat YYYY-MM-DD
  section Backend
    API Design      :a1, 2026-03-01, 3d
    Implementation  :a2, after a1, 5d
  section Frontend
    UI Mockups      :b1, 2026-03-01, 2d
    Components      :b2, after b1, 5d
  section QA
    Testing         :after a2, 3d`,
  },
  {
    name: "Git Graph",
    category: "Project",
    code: `gitGraph
  commit
  commit
  branch feature
  checkout feature
  commit
  commit
  checkout main
  merge feature
  commit`,
  },
  {
    name: "Mindmap",
    category: "Basic",
    code: `mindmap
  root((Project))
    Frontend
      React
      CSS
      TypeScript
    Backend
      API
      Database
      Auth
    DevOps
      CI/CD
      Monitoring`,
  },
  {
    name: "Timeline",
    category: "Basic",
    code: `timeline
  title Product Launch Timeline
  section Q1
    Jan : Research phase
        : Market analysis
    Feb : Design sprint
    Mar : Prototype ready
  section Q2
    Apr : Alpha release
    May : Beta testing
    Jun : Public launch`,
  },
  {
    name: "User Journey",
    category: "Basic",
    code: `journey
  title User Checkout Experience
  section Browse
    Visit homepage: 5: User
    Search product: 4: User
    View details: 4: User
  section Purchase
    Add to cart: 5: User
    Enter payment: 2: User
    Confirm order: 4: User
  section Post-purchase
    Receive email: 5: User, System
    Track delivery: 3: User`,
  },
  {
    name: "C4 Context",
    category: "Architecture",
    code: `C4Context
  title System Context Diagram
  Person(user, "User", "A customer of the system")
  System(system, "E-Commerce Platform", "Allows users to browse and buy products")
  System_Ext(payment, "Payment Gateway", "Handles payment processing")
  System_Ext(email, "Email Service", "Sends order confirmations")

  Rel(user, system, "Browses and purchases", "HTTPS")
  Rel(system, payment, "Processes payments", "API")
  Rel(system, email, "Sends notifications", "SMTP")`,
  },
  {
    name: "C4 Container",
    category: "Architecture",
    code: `C4Container
  title Container Diagram
  Person(user, "User", "A customer")

  System_Boundary(sys, "E-Commerce Platform") {
    Container(web, "Web App", "React", "User interface")
    Container(api, "API Server", "Node.js", "Business logic")
    ContainerDb(db, "Database", "PostgreSQL", "Stores products, orders")
    Container(cache, "Cache", "Redis", "Session & product cache")
  }

  Rel(user, web, "Uses", "HTTPS")
  Rel(web, api, "Calls", "JSON/HTTPS")
  Rel(api, db, "Reads/Writes", "SQL")
  Rel(api, cache, "Caches", "TCP")`,
  },
  {
    name: "C4 Component",
    category: "Architecture",
    code: `C4Component
  title Component Diagram - API Server
  Container_Boundary(api, "API Server") {
    Component(auth, "Auth Controller", "Express", "Handles authentication")
    Component(orders, "Order Controller", "Express", "Manages orders")
    Component(products, "Product Service", "Node.js", "Product catalog logic")
    Component(repo, "Repository", "Prisma", "Data access layer")
  }

  Rel(auth, repo, "Uses")
  Rel(orders, repo, "Uses")
  Rel(orders, products, "Uses")`,
  },
  {
    name: "Architecture (Cloud)",
    category: "Architecture",
    code: `architecture-beta
  group cloud(logos:aws)[AWS Cloud]

  service api(logos:aws-lambda)[Lambda API] in cloud
  service db(logos:aws-dynamodb)[DynamoDB] in cloud
  service cdn(logos:aws-cloudfront)[CloudFront] in cloud
  service s3(logos:aws-s3)[S3 Bucket] in cloud
  service gw(logos:aws-api-gateway)[API Gateway] in cloud

  cdn:R --> L:gw
  gw:R --> L:api
  api:R --> L:db
  cdn:B --> T:s3`,
  },
  {
    name: "Architecture (K8s)",
    category: "Architecture",
    code: `architecture-beta
  group cluster(logos:kubernetes)[K8s Cluster]
  group ns(logos:kubernetes)[Namespace: prod] in cluster

  service ing(logos:nginx)[Ingress] in ns
  service api(logos:nodejs-icon)[API Pods] in ns
  service worker(logos:nodejs-icon)[Worker Pods] in ns
  service db(logos:postgresql)[PostgreSQL] in ns
  service redis(logos:redis)[Redis] in ns
  service queue(logos:rabbitmq)[RabbitMQ] in ns

  ing:R --> L:api
  api:R --> L:db
  api:B --> T:redis
  api:R --> L:queue
  queue:R --> L:worker
  worker:B --> T:db`,
  },
  {
    name: "Block Diagram",
    category: "Advanced",
    code: `block-beta
  columns 3
  a["Frontend"]:3
  block:b:2
    c["API Gateway"]
    d["Auth Service"]
  end
  e["Database"]
  f["Cache"]:2
  g["Queue"]`,
  },
  {
    name: "Requirement Diagram",
    category: "Advanced",
    code: `requirementDiagram

  requirement high_availability {
    id: REQ-001
    text: System uptime >= 99.9%
    risk: high
    verifymethod: test
  }

  requirement data_encryption {
    id: REQ-002
    text: All data encrypted at rest
    risk: medium
    verifymethod: inspection
  }

  element load_balancer {
    type: service
    docref: arch/lb.md
  }

  element tls_cert {
    type: config
    docref: security/tls.md
  }

  load_balancer - satisfies -> high_availability
  tls_cert - satisfies -> data_encryption`,
  },
  {
    name: "Quadrant Chart",
    category: "Data",
    code: `quadrantChart
  title Tech Radar - Build vs Buy
  x-axis Low Effort --> High Effort
  y-axis Low Impact --> High Impact
  quadrant-1 Build In-house
  quadrant-2 Strategic Partner
  quadrant-3 Deprioritize
  quadrant-4 Quick Wins
  Auth Service: [0.8, 0.9]
  Logging: [0.2, 0.4]
  CI Pipeline: [0.3, 0.8]
  CMS: [0.7, 0.3]
  Analytics: [0.5, 0.6]
  Monitoring: [0.2, 0.7]`,
  },
  {
    name: "Sankey Diagram",
    category: "Data",
    code: `sankey-beta

  Traffic,Homepage,40
  Traffic,Product Page,30
  Traffic,Blog,20
  Traffic,Other,10
  Homepage,Sign Up,15
  Homepage,Browse,25
  Product Page,Add to Cart,18
  Product Page,Bounce,12
  Add to Cart,Purchase,10
  Add to Cart,Abandon,8`,
  },
  {
    name: "XY Chart",
    category: "Data",
    code: `xychart-beta
  title "Monthly Revenue 2026"
  x-axis [Jan, Feb, Mar, Apr, May, Jun]
  y-axis "Revenue (USD)" 0 --> 50000
  bar [12000, 18000, 22000, 28000, 35000, 42000]
  line [10000, 15000, 20000, 25000, 32000, 40000]`,
  },
  {
    name: "Radar Chart",
    category: "Data",
    code: `radar-beta
  title "Team Skill Assessment"
  axis Frontend, Backend, DevOps, Design, Testing, Communication
  curve a["Alice"] { 90, 60, 40, 80, 70, 85 }
  curve b["Bob"] { 50, 90, 85, 30, 75, 60 }`,
  },
  {
    name: "Kanban Board",
    category: "Project",
    code: `kanban
  Backlog
    Design system tokens
    API rate limiting
  Todo
    User auth flow
    Dashboard charts
  In Progress
    Search feature @{ assigned: 'alice' }
    CI pipeline @{ assigned: 'bob' }
  Done
    Project setup
    Database schema`,
  },
  {
    name: "Packet Diagram",
    category: "Advanced",
    code: `packet-beta
  0-15: "Source Port"
  16-31: "Destination Port"
  32-63: "Sequence Number"
  64-95: "Acknowledgment Number"
  96-99: "Data Offset"
  100-105: "Reserved"
  106: "URG"
  107: "ACK"
  108: "PSH"
  109: "RST"
  110: "SYN"
  111: "FIN"
  112-127: "Window Size"
  128-143: "Checksum"
  144-159: "Urgent Pointer"`,
  },
];
