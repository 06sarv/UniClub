// =====================================================================
// UniClub — API Layer (Supabase Client Wrapper)
// Loaded after config.js and supabase-js CDN
// =====================================================================

/* global supabase */  // from CDN

// ── Supabase Client Initialization ───────────────────────────────────
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const UniClubAPI = {

  // ═══════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════
  async signUp(email, password, fullName, role, department) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, department }
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    // Clear any lingering localStorage
    localStorage.removeItem('uniclub_signedIn');
    localStorage.removeItem('uniclub_role');
  },

  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  onAuthChange(callback) {
    return sb.auth.onAuthStateChange(callback);
  },

  // ═══════════════════════════════════════════════════════════════════
  // PROFILES
  // ═══════════════════════════════════════════════════════════════════
  async getProfile(userId) {
    const { data, error } = await sb.from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getMyProfile() {
    const user = await this.getUser();
    if (!user) return null;
    return this.getProfile(user.id);
  },

  async updateProfile(userId, updates) {
    const { data, error } = await sb.from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async saveQuizAnswers(interests, commitment, focus) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    return this.updateProfile(user.id, {
      quiz_interests: interests,
      quiz_commitment: commitment,
      quiz_focus: focus,
    });
  },

  // ═══════════════════════════════════════════════════════════════════
  // CLUBS
  // ═══════════════════════════════════════════════════════════════════
  async getAllClubs() {
    const { data, error } = await sb.from('clubs_with_stats')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getClub(clubId) {
    const { data, error } = await sb.from('clubs_with_stats')
      .select('*')
      .eq('id', clubId)
      .single();
    if (error) throw error;
    return data;
  },

  async getClubBySlug(slug) {
    const { data, error } = await sb.from('clubs_with_stats')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  async getFacultyClubs(facultyId) {
    const { data, error } = await sb.from('clubs_with_stats')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createClub(clubData) {
    const { data, error } = await sb.from('clubs')
      .insert(clubData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateClub(clubId, updates) {
    const { data, error } = await sb.from('clubs')
      .update(updates)
      .eq('id', clubId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteClub(clubId) {
    const { error } = await sb.from('clubs')
      .delete()
      .eq('id', clubId);
    if (error) throw error;
  },

  async getRecommendedClubs() {
    const user = await this.getUser();
    if (!user) return [];
    const { data, error } = await sb.rpc('get_recommended_clubs', { user_uuid: user.id });
    if (error) throw error;
    // Fetch full club details for scored clubs
    if (!data || data.length === 0) return this.getAllClubs();
    const clubIds = data.filter(d => d.score > 0).map(d => d.club_id);
    if (clubIds.length === 0) return this.getAllClubs();
    const { data: clubs } = await sb.from('clubs_with_stats')
      .select('*')
      .in('id', clubIds);
    // Sort by score
    const scoreMap = {};
    data.forEach(d => scoreMap[d.club_id] = d.score);
    return (clubs || []).sort((a, b) => (scoreMap[b.id] || 0) - (scoreMap[a.id] || 0));
  },

  // ═══════════════════════════════════════════════════════════════════
  // CLUB MEMBERS
  // ═══════════════════════════════════════════════════════════════════
  async getClubMembers(clubId) {
    const { data, error } = await sb.from('club_members')
      .select('*, profiles(full_name, email, department, year)')
      .eq('club_id', clubId)
      .order('role');
    if (error) throw error;
    return data;
  },

  async getMyMemberships() {
    const user = await this.getUser();
    if (!user) return [];
    const { data, error } = await sb.from('club_members')
      .select('*, clubs(id, name, slug, category, domain)')
      .eq('user_id', user.id);
    if (error) throw error;
    return data;
  },

  async joinClub(clubId, role = 'Member') {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await sb.from('club_members')
      .insert({ club_id: clubId, user_id: user.id, role })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async leaveClub(clubId) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await sb.from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.id);
    if (error) throw error;
  },

  async updateMemberRole(clubId, userId, newRole) {
    const { data, error } = await sb.from('club_members')
      .update({ role: newRole })
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeMember(clubId, userId) {
    const { error } = await sb.from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async isMember(clubId) {
    const user = await this.getUser();
    if (!user) return false;
    const { data } = await sb.from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .maybeSingle();
    return !!data;
  },

  // ═══════════════════════════════════════════════════════════════════
  // POSTS
  // ═══════════════════════════════════════════════════════════════════
  async getAllPosts(limit = 50) {
    const { data, error } = await sb.from('posts_with_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getFacultyPosts(facultyId) {
    const { data, error } = await sb.from('posts_with_stats')
      .select('*')
      .eq('author_id', facultyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPost(postData) {
    const { data, error } = await sb.from('posts')
      .insert(postData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePost(postId) {
    const { error } = await sb.from('posts')
      .delete()
      .eq('id', postId);
    if (error) throw error;
  },

  // ── Likes ──
  async likePost(postId) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await sb.from('post_likes')
      .insert({ post_id: postId, user_id: user.id });
    if (error && error.code !== '23505') throw error; // ignore duplicate
  },

  async unlikePost(postId) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await sb.from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (error) throw error;
  },

  async hasLikedPost(postId) {
    const user = await this.getUser();
    if (!user) return false;
    const { data } = await sb.from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();
    return !!data;
  },

  async getPostLikeCount(postId) {
    const { count, error } = await sb.from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    if (error) throw error;
    return count;
  },

  // ── Comments ──
  async getPostComments(postId) {
    const { data, error } = await sb.from('post_comments')
      .select('*, profiles(full_name)')
      .eq('post_id', postId)
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async addComment(postId, body, parentId = null) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const row = { post_id: postId, user_id: user.id, body };
    if (parentId) row.parent_id = parentId;
    const { data, error } = await sb.from('post_comments')
      .insert(row)
      .select('*, profiles(full_name)')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComment(commentId) {
    const { error } = await sb.from('post_comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
  },

  // ── Impressions ──
  async recordImpression(postId) {
    const user = await this.getUser();
    if (!user) return;
    await sb.from('post_impressions')
      .insert({ post_id: postId, user_id: user.id })
      .select(); // fire and forget mostly
  },

  async getFacultyImpressions(facultyId, days = 14) {
    const { data, error } = await sb.rpc('get_faculty_impressions', {
      faculty_uuid: facultyId,
      days_back: days,
    });
    if (error) throw error;
    return data || [];
  },

  // ═══════════════════════════════════════════════════════════════════
  // JOIN / LEAVE REQUESTS
  // ═══════════════════════════════════════════════════════════════════
  async requestJoin(clubId, message = '') {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await sb.from('join_requests')
      .insert({ club_id: clubId, user_id: user.id, type: 'join', message })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async requestLeave(clubId, message = '') {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await sb.from('join_requests')
      .insert({ club_id: clubId, user_id: user.id, type: 'leave', message })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async hasPendingRequest(clubId, type) {
    const user = await this.getUser();
    if (!user) return false;
    const { data } = await sb.from('join_requests')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('status', 'pending')
      .maybeSingle();
    return !!data;
  },

  async getMyRequests() {
    const user = await this.getUser();
    if (!user) return [];
    const { data, error } = await sb.from('join_requests')
      .select('*, clubs(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getClubRequests(clubId) {
    const { data, error } = await sb.from('join_requests')
      .select('*, profiles(full_name, email, department)')
      .eq('club_id', clubId)
      .eq('status', 'pending')
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async cancelRequest(requestId) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    // Students can only cancel their own pending requests
    const { error } = await sb.from('join_requests')
      .delete()
      .eq('id', requestId)
      .eq('user_id', user.id)
      .eq('status', 'pending');
    if (error) throw error;
  },

  async getAllFacultyRequests(facultyId) {
    // Only show LEAVE requests — faculty no longer handles join requests
    const clubs = await this.getFacultyClubs(facultyId);
    const clubIds = clubs.map(c => c.id);
    if (clubIds.length === 0) return [];
    const { data, error } = await sb.from('join_requests')
      .select('*, profiles(full_name, email, department), clubs(name)')
      .in('club_id', clubIds)
      .eq('type', 'leave')
      .eq('status', 'pending')
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async approveRequest(requestId) {
    const { data: request } = await sb.from('join_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    if (!request) throw new Error('Request not found');

    // Update request status
    await sb.from('join_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', requestId);

    // If join request, add as member
    if (request.type === 'join') {
      await sb.from('club_members')
        .upsert({ club_id: request.club_id, user_id: request.user_id, role: 'Member' },
                 { onConflict: 'club_id,user_id' });
    }
    // If leave request, remove membership
    if (request.type === 'leave') {
      await sb.from('club_members')
        .delete()
        .eq('club_id', request.club_id)
        .eq('user_id', request.user_id);
    }
  },

  async rejectRequest(requestId) {
    await sb.from('join_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', requestId);
  },

  // ═══════════════════════════════════════════════════════════════════
  // MEMBER MANAGEMENT (Faculty direct adds/removes/role changes)
  // ═══════════════════════════════════════════════════════════════════
  async addMember(clubId, userId, role = 'Member') {
    const { data, error } = await sb.from('club_members')
      .upsert({ club_id: clubId, user_id: userId, role }, { onConflict: 'club_id,user_id' })
      .select();
    if (error) throw error;
    return data;
  },

  async removeMember(clubId, userId) {
    const { error } = await sb.from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async updateMemberRole(clubId, userId, role) {
    const { error } = await sb.from('club_members')
      .update({ role })
      .eq('club_id', clubId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async addMemberByEmail(clubId, fullName, email, role = 'Member') {
    // Look up student by email first
    const { data: profile } = await sb.from('profiles')
      .select('id')
      .eq('email', email)
      .eq('role', 'student')
      .maybeSingle();
    if (profile) {
      return this.addMember(clubId, profile.id, role);
    }
    // Student not found — create a placeholder profile via service-side workaround:
    // We insert directly into club_members with a new profile.
    // But we can't create auth users on frontend. So we signal the error.
    throw new Error(`No registered student found with email "${email}". They must sign up first.`);
  },

  async searchStudents(query) {
    if (!query || query.length < 2) return [];
    const { data, error } = await sb.from('profiles')
      .select('id, full_name, email, department, year')
      .eq('role', 'student')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  // ═══════════════════════════════════════════════════════════════════
  // FACULTY STATS
  // ═══════════════════════════════════════════════════════════════════
  async getFacultyStats(facultyId) {
    const clubs = await this.getFacultyClubs(facultyId);
    const posts = await this.getFacultyPosts(facultyId);

    let totalMembers = 0;
    for (const club of clubs) {
      totalMembers += club.member_count || 0;
    }

    let totalImpressions = 0;
    let totalLikes = 0;
    for (const post of posts) {
      totalImpressions += post.impression_count || 0;
      totalLikes += post.like_count || 0;
    }

    return {
      totalClubs: clubs.length,
      totalMembers,
      totalPosts: posts.length,
      totalImpressions,
      totalLikes,
      clubs,
      posts,
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // IMAGE UPLOAD (Supabase Storage)
  // ═══════════════════════════════════════════════════════════════════
  async uploadPostImage(file) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `post-images/${user.id}/${Date.now()}.${ext}`;
    const { data, error } = await sb.storage.from('uniclub').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data: urlData } = sb.storage.from('uniclub').getPublicUrl(path);
    return urlData.publicUrl;
  },

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════
  getInitials(name) {
    return (name || '').trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('') || '??';
  },
};

// Make globally available
window.UniClubAPI = UniClubAPI;
window.sb = sb;
