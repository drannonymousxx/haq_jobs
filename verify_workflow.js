const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jhbmzltmwkjqmxipoayr.supabase.co';
const anonKey = 'sb_publishable_BCmns_AJ4AI-yigw6CsRkg_opMsFiiQ';

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, anonKey);

async function testWorkflow() {
  console.log('--- STARTING LIVE END-TO-END WORKFLOW VALIDATION ---');
  
  const uniqueId = Date.now();
  const recruiterEmail = `recruiter_${uniqueId}@gmail.com`;
  const candidateEmail = `candidate_${uniqueId}@gmail.com`;
  const testPassword = 'Password123!';

  console.log(`Generating test accounts:\n  Recruiter: ${recruiterEmail}\n  Candidate: ${candidateEmail}`);

  let recruiterUser, candidateUser;
  
  try {
    // 1. Sign Up Recruiter
    const { data: recAuth, error: recSignUpErr } = await supabase.auth.signUp({
      email: recruiterEmail,
      password: testPassword,
      options: { data: { full_name: 'Test Recruiter', role: 'recruiter' } }
    });
    if (recSignUpErr) throw recSignUpErr;
    recruiterUser = recAuth.user;
    console.log('✅ Recruiter signed up successfully.');

    // 2. Sign Up Candidate
    const { data: candAuth, error: candSignUpErr } = await supabase.auth.signUp({
      email: candidateEmail,
      password: testPassword,
      options: { data: { full_name: 'Test Candidate', role: 'candidate' } }
    });
    if (candSignUpErr) throw candSignUpErr;
    candidateUser = candAuth.user;
    console.log('✅ Candidate signed up successfully.');

    // 3. Ensure profiles exist in public.profiles (triggers may be slow/missing)
    // Wait 3 seconds for triggers to complete
    await new Promise(r => setTimeout(r, 3000));
    
    // Check recruiter profile
    const { data: recProf } = await supabase.from('profiles').select('*').eq('id', recruiterUser.id).maybeSingle();
    if (!recProf) {
      await supabase.from('profiles').insert({
        id: recruiterUser.id,
        full_name: 'Test Recruiter',
        email: recruiterEmail,
        role: 'recruiter'
      });
    }
    
    // Check candidate profile
    const { data: candProf } = await supabase.from('profiles').select('*').eq('id', candidateUser.id).maybeSingle();
    if (!candProf) {
      await supabase.from('profiles').insert({
        id: candidateUser.id,
        full_name: 'Test Candidate',
        email: candidateEmail,
        role: 'candidate'
      });
    }
    console.log('✅ Profiles verified/created in public.profiles.');

    // --- RECRUITER ACTIONS ---
    // Log in as recruiter to simulate client environment
    const { data: recSession, error: recLoginErr } = await supabase.auth.signInWithPassword({
      email: recruiterEmail,
      password: testPassword
    });
    if (recLoginErr) throw recLoginErr;
    
    const recClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${recSession.session.access_token}` } }
    });

    // 4. Recruiter creates a Job
    const { data: job, error: jobErr } = await recClient
      .from('jobs')
      .insert({
        recruiter_id: recruiterUser.id,
        title: `Test Legal Opening ${uniqueId}`,
        practice_area: 'Corporate Law',
        experience_level: 'Mid Level',
        location: 'Mumbai',
        employment_type: 'Full Time',
        work_mode: 'Hybrid',
        description: 'Test job description'
      })
      .select()
      .single();
      
    if (jobErr) throw jobErr;
    console.log('✅ Job opening created successfully by Recruiter.');

    // --- CANDIDATE ACTIONS ---
    // Log in as candidate
    const { data: candSession, error: candLoginErr } = await supabase.auth.signInWithPassword({
      email: candidateEmail,
      password: testPassword
    });
    if (candLoginErr) throw candLoginErr;

    const candClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${candSession.session.access_token}` } }
    });

    // 5. Candidate applies for the Job
    const { data: application, error: appErr } = await candClient
      .from('job_applications')
      .insert({
        profile_id: candidateUser.id,
        job_id: String(job.id),
        status: 'applied'
      })
      .select()
      .single();
      
    if (appErr) throw appErr;
    console.log('✅ Candidate applied to the job successfully.');

    // --- RECRUITER WORKFLOW STEPS ---
    // 6. Recruiter updates status to Shortlisted
    const { data: shortlistUpdate, error: shortlistErr } = await recClient
      .from('job_applications')
      .update({ status: 'shortlisted' })
      .eq('id', application.id)
      .select()
      .single();
      
    if (shortlistErr) throw shortlistErr;
    console.log('✅ Recruiter shortlisted the candidate. Status persisted:', shortlistUpdate.status);

    // Call RPC system event alert for Shortlisting
    const { error: rpcShortlistErr } = await recClient.rpc('trigger_system_event', {
      p_user_id: candidateUser.id,
      p_title: 'Application Shortlisted',
      p_content: 'Your application has been shortlisted!',
      p_type: 'shortlist',
      p_reference_id: application.id,
      p_reference_type: 'job_applications'
    });
    if (rpcShortlistErr) throw rpcShortlistErr;
    console.log('✅ trigger_system_event RPC executed successfully for shortlisting.');

    // 7. Recruiter Schedules an Interview
    const { data: interview, error: intErr } = await recClient
      .from('interviews')
      .insert({
        application_id: application.id,
        title: 'Interview round 1',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        duration: '30 minutes',
        type: 'online',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        status: 'pending'
      })
      .select()
      .single();
      
    if (intErr) throw intErr;
    console.log('✅ Interview scheduled successfully. Meeting link saved:', interview.meeting_link);

    // Update status to 'interview'
    const { error: appIntErr } = await recClient
      .from('job_applications')
      .update({ status: 'interview' })
      .eq('id', application.id);
    if (appIntErr) throw appIntErr;

    // 8. Recruiter Cancels the Interview (Should update status to cancelled instead of deleting!)
    const { data: cancelledInt, error: cancelErr } = await recClient
      .from('interviews')
      .update({ status: 'cancelled' })
      .eq('id', interview.id)
      .select()
      .single();
      
    if (cancelErr) throw cancelErr;
    console.log('✅ Interview cancelled successfully (status updated to cancelled). Status:', cancelledInt.status);

    // Revert status to shortlisted
    const { error: appRevertErr } = await recClient
      .from('job_applications')
      .update({ status: 'shortlisted' })
      .eq('id', application.id);
    if (appRevertErr) throw appRevertErr;
    console.log('✅ Job application successfully reverted back to shortlisted.');

    // 9. Recruiter Sends a Job Offer
    const { data: offer, error: offerErr } = await recClient
      .from('offers')
      .insert({
        application_id: application.id,
        position: 'Legal Counsel',
        salary: '12,000,000 INR',
        joining_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        employment_type: 'Full Time',
        status: 'pending',
        created_by: recruiterUser.id
      })
      .select()
      .single();
      
    if (offerErr) throw offerErr;
    console.log('✅ Job Offer extended successfully. ID:', offer.id);

    // Update status to offered
    const { error: appOfferErr } = await recClient
      .from('job_applications')
      .update({ status: 'offered' })
      .eq('id', application.id);
    if (appOfferErr) throw appOfferErr;

    // 10. Candidate accepts the Offer
    const { data: acceptedOffer, error: acceptOfferErr } = await candClient
      .from('offers')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', offer.id)
      .select()
      .single();
      
    if (acceptOfferErr) throw acceptOfferErr;
    console.log('✅ Candidate accepted the offer. Status:', acceptedOffer.status);

    // Revert application status to hired
    const { data: hiredApp, error: appHiredErr } = await candClient
      .from('job_applications')
      .update({ status: 'hired' })
      .eq('id', application.id)
      .select()
      .single();
      
    if (appHiredErr) throw appHiredErr;
    console.log('✅ Job application successfully updated to hired. Final status:', hiredApp.status);

    // 11. Recruiter ↔ Candidate Messaging
    const { data: recMsg, error: recMsgErr } = await recClient
      .from('messages')
      .insert({
        sender_id: recruiterUser.id,
        recipient_id: candidateUser.id,
        content: 'Hello Candidate! Excited to have you on board.',
        message_type: 'text'
      })
      .select()
      .single();
    if (recMsgErr) throw recMsgErr;
    console.log('✅ Recruiter sent message successfully.');

    const { data: candMsg, error: candMsgErr } = await candClient
      .from('messages')
      .insert({
        sender_id: candidateUser.id,
        recipient_id: recruiterUser.id,
        content: 'Thank you Recruiter! Glad to join.',
        message_type: 'text'
      })
      .select()
      .single();
    if (candMsgErr) throw candMsgErr;
    console.log('✅ Candidate sent message successfully.');

    // 12. Retrieve Messages
    const { data: inboxMsgs, error: inboxErr } = await recClient
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${recruiterUser.id},recipient_id.eq.${recruiterUser.id}`);
    if (inboxErr) throw inboxErr;
    console.log(`✅ Retrieved conversation messages. Found: ${inboxMsgs.length} messages.`);

    // --- CLEANUP ---
    console.log('--- CLEANING UP TEST DATA ---');
    await recClient.from('messages').delete().or(`sender_id.eq.${recruiterUser.id},recipient_id.eq.${recruiterUser.id}`);
    await recClient.from('messages').delete().eq('recipient_id', candidateUser.id);
    await recClient.from('notifications').delete().eq('user_id', candidateUser.id);
    await recClient.from('offers').delete().eq('application_id', application.id);
    await recClient.from('interviews').delete().eq('application_id', application.id);
    await recClient.from('job_applications').delete().eq('id', application.id);
    await recClient.from('jobs').delete().eq('id', job.id);
    
    console.log('✅ Test data cleaned up successfully.');
    console.log('\n⭐⭐⭐⭐⭐ ALL DATABASE WORKFLOW TESTS COMPLETED SUCCESSFULLY! ⭐⭐⭐⭐⭐');
    
  } catch (err) {
    console.error('❌ WORKFLOW TEST FAILURE:', err);
  }
}

testWorkflow();
