// INSERT USER
const { data: insertData, error: insertError } = await supabase
  .from('users')
  .insert([{ name: 'John', email: 'john@email.com' }]);

if (insertError) {
  console.error("Insert Error:", insertError);
} else {
  console.log("Inserted:", insertData);
}


// FETCH USERS
const { data: usersData, error: fetchError } = await supabase
  .from('users')
  .select('*');

if (fetchError) {
  console.error("Fetch Error:", fetchError);
} else {
  console.log("Users:", usersData);
}


// SIGN UP USER
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'user@email.com',
  password: 'password123'
});

if (authError) {
  console.error("Signup Error:", authError);
} else {
  console.log("Signed Up:", authData);
}