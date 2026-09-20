# Trizen PhotoShare — Full-Stack Collaborative Photo Sharing Platform

> **Full-Stack Internship Challenge Submission**  
> **Company**: TrizenAI Technologies Private Limited  
> **Role**: Full-Stack Internship  
> **Submission Email**: `talent@trizen-ai.com`  
> **Deadline**: September 20, 2026 — 11:59 PM IST  

---

## 1. Project Overview

Trizen PhotoShare is a full-stack, role-governed photo sharing platform designed for event photography teams, administrative leads, and event clients/guests.

- **Collaborative Team Uploads**: Event photographers and team members upload multiple high-resolution photos in real-time to object/disk storage.
- **Admin Curation & Lead Control**: Administrative leads review all raw uploaded photos, select approved shots for publishing, manage assigned photographers, and configure PIN-protected customer galleries.
- **PIN-Protected Customer Galleries**: Event customers and guests access their curated gallery using a shareable link and a secure PIN—without needing to register or create an account.
- **Complete Role-Based Security**: Strict backend API authorization barriers prevent unauthorized access, enforce event boundaries, and block non-admin users from publishing galleries or managing other users' photos.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | High-performance interactive UI with strict type safety |
| **Build & Tooling** | Vite 6 | Rapid compilation, module bundling, and client dev server |
| **Styling** | Tailwind CSS v4 | Responsive, human-crafted design with mobile-first layout |
| **Animations** | Motion (`motion/react`) | Fluid transitions, modal entries, and gallery interactions |
| **Icons** | Lucide React | Consistent, accessible iconography |
| **Backend Framework** | Node.js + Express 4 (`server.ts`) | RESTful API endpoints, role-based middleware, and test runner |
| **File / Object Storage** | Multer Storage Engine (`/uploads`) | Dedicated file storage handling multi-part uploads up to 25MB/file |
| **Database & Persistence**| JSON Document Database (`/data/db.json`)| Complete entity modeling: Users, Events, Photo Metadata, and Galleries |
| **Testing** | Automated System Test Suite (`/api/system/tests`) | End-to-end API verification for RBAC, PINs, and photo isolation |

---

## 3. System Architecture & Database Design

### 3.1 Architectural Diagram

```
+-------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                  |
|                                                                               |
|  +--------------------+  +----------------------+  +------------------------+ |
|  |    Admin / Lead    |  |     Team Member      |  |     Guest Customer     | |
|  |  Event Management  |  |   Assigned Uploads   |  |   PIN-Protected Access | |
|  |  Photo Curation    |  |   My Photos View     |  |   Lightbox & Downloads | |
|  +---------+----------+  +----------+-----------+  +-----------+------------+ |
+------------|------------------------|--------------------------|--------------+
             | Bearer Token (Admin)   | Bearer Token (Member)    | x-gallery-pin
             v                        v                          v
+-------------------------------------------------------------------------------+
|                       NODE.JS / EXPRESS REST API BACKEND                      |
|                                                                               |
|   [Auth & RBAC Middleware] ---> [Event Guard] ---> [Gallery PIN Validator]   |
|                                                                               |
|   Endpoints:                                                                  |
|   - /api/auth/*          (Login, Register, Me)                                |
|   - /api/events/*        (CRUD, Team Assignments, Photo Curation)            |
|   - /api/events/:id/photos/upload (Multer Multi-part Processing)              |
|   - /api/gallery/:slug/* (PIN Verification, Customer View, Downloads)         |
|   - /api/system/tests    (Automated RBAC & Boundary Security Tests)           |
+------------------------------+--------------------------+---------------------+
                               |                          |
                               v                          v
               +-------------------------------+  +-------------------+
               |      OBJECT / FILE STORAGE    |  | DATABASE (JSON)   |
               |       (Dedicated Disk)        |  |  - Users          |
               |                               |  |  - Events         |
               |  - /uploads/photo-*.jpg       |  |  - Photo Metadata |
               |  - Validated Mime & Size      |  |  - Galleries      |
               +-------------------------------+  +-------------------+
```

### 3.2 Database Schema (`db.json`)

#### **Users Collection**
```typescript
interface User {
  id: string;            // 'usr-admin-01', 'usr-team-01'
  name: string;          // 'Aarav Sharma'
  email: string;         // 'admin@trizen.com'
  role: 'admin' | 'team_member';
  avatar?: string;
  createdAt: string;
}
```

#### **Events Collection**
```typescript
interface EventItem {
  id: string;                     // 'evt-arjun-priya'
  name: string;                   // 'Arjun & Priya Wedding'
  description: string;
  date: string;                   // '2026-09-15'
  location: string;               // 'The Leela Palace, Udaipur'
  clientName: string;             // 'Arjun Singhania & Priya Nair'
  coverPhoto?: string;
  createdById: string;            // 'usr-admin-01'
  assignedTeamMemberIds: string[]; // ['usr-team-01', 'usr-team-02']
  gallery: {
    isPublished: boolean;         // true
    slug: string;                 // 'abc123'
    pin: string;                  // '482917'
    publishedAt?: string;
    expiresAt?: string;
    allowDownloads: boolean;
    welcomeMessage?: string;
  };
  createdAt: string;
}
```

#### **Photo Metadata Collection**
*Adhering strictly to Section 4 of the requirement specification:*
```typescript
interface PhotoMetadata {
  id: string;               // 'p-01'
  eventId: string;          // 'evt-arjun-priya'
  uploadedBy: {
    id: string;             // 'usr-team-01'
    name: string;           // 'Rahul Verma'
    role: 'team_member' | 'admin';
  };
  filename: string;         // 'photo-1725700000.jpg'
  originalFilename: string; // 'IMG_4821_Mandap_Royal.jpg'
  storageLocation: string;  // '/uploads/photo-1725700000.jpg'
  fileSize: number;         // bytes (e.g. 4280540)
  mimeType: string;         // 'image/jpeg'
  isSelected: boolean;      // true if selected by admin for publishing
  category?: string;        // 'Ceremony' | 'Portraits' | 'Reception' | 'Haldi'
  createdAt: string;
}
```

---

## 4. Expected Workflow Implementation (Step-by-Step)

| Step | Actor | Action in App |
| :---: | :--- | :--- |
| **1** | **Admin** | Creates Event ("Arjun & Priya Wedding") and assigns Team Members (Rahul & Ananya). |
| **2** | **Team Member** | Logs in, navigates to assigned event, and uploads multiple photos using the multi-file drag-and-drop uploader. |
| **3** | **Admin** | Reviews all uploaded photos, filters by photographer or category, and marks approved photos as **Selected for Publishing**. |
| **4** | **Admin** | Opens the Gallery Publishing modal, sets PIN (`482917`), custom slug (`abc123`), and clicks **Publish Gallery**. |
| **5** | **Customer** | Receives Gallery Link (`/gallery/abc123`), enters PIN `482917`, unlocks the curated gallery, views high-res photos, and downloads memories. |

---

## 5. Security & Boundary Scenarios Handled

1. **Attempting to access another event**: If a team member attempts to query an unassigned event via API or URL, the backend returns **HTTP 403 Forbidden** (`Access Denied: You are not assigned to this event`).
2. **Team Member attempting to publish a gallery**: The endpoint `POST /api/events/:id/gallery/publish` strictly enforces `role === 'admin'`. Non-admins receive **HTTP 403 Forbidden** (`Security Violation: Only Admin / Lead can publish`).
3. **Failed photo upload**: File size limits (25MB max) and MIME type validation (JPEG, PNG, WEBP, GIF, AVIF) prevent malformed uploads, returning clear **HTTP 400 Bad Request** errors.
4. **Incorrect gallery PIN**: Customers entering an invalid PIN receive **HTTP 401 Unauthorized** (`Incorrect PIN entered`). Failed attempts are tracked.
5. **Attempted access to unpublished photos**: The customer gallery API endpoint strictly queries `p.eventId === event.id && p.isSelected`. Raw, uncurated, or rejected photos are never exposed to the client.

---

## 6. Demo Credentials & Deliverables

### Live Operational State (Matching PDF Example):
- **Event Name**: Arjun & Priya Wedding
- **Total Uploaded Photos**: 1,250 (Pre-seeded with real wedding event photography)
- **Selected for Publishing**: 600
- **Gallery URL Slug**: `abc123` (or direct link via UI)
- **Access PIN**: `482917`

### Demo Credentials:
- **Admin / Lead**:
  - Email: `admin@trizen.com`
  - Password: `admin123`
  - Name: *Aarav Sharma*
- **Team Member (Lead Photographer)**:
  - Email: `rahul@trizen.com`
  - Password: `team123`
  - Name: *Rahul Verma*
- **Team Member (Candid Photographer)**:
  - Email: `ananya@trizen.com`
  - Password: `team123`
  - Name: *Ananya Sen*
- **Customer Gallery Access**:
  - URL: Direct click in app or `/gallery/abc123`
  - PIN: `482917`

---

## 7. Local Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/your-username/trizen-photo-sharing.git
cd trizen-photo-sharing

# 2. Install dependencies
npm install

# 3. Start development server (boots Express backend & Vite frontend)
npm run dev

# 4. Open in browser
http://localhost:3000
```

### Environment Variables (`.env.example`):
```env
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
```

### Production Build:
```bash
npm run build
npm run start
```

---

## 8. Automated Testing

Trizen PhotoShare includes an integrated, executable test suite available both via API (`GET /api/system/tests`) and via the **"Run System Tests"** button in the top navigation bar.

Tests include:
1. **Admin Role Verification & Privileges**
2. **Team Member Publishing Lockdown (HTTP 403 enforcement)**
3. **Event Isolation & Multi-tenant Boundary Check**
4. **Gallery Credentials & PIN Access Verification**
5. **Customer Access Boundary (Unpublished Photos Filter)**
6. **Photo Metadata Schema Conformance**

---

*Developed for TrizenAI Technologies Private Limited — Full Stack Internship Challenge.*
