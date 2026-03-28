function VerifySuccess(){

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">

<div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow text-center">

<h1 className="text-3xl font-bold text-green-500 mb-4">
Email Verified ✅
</h1>

<p className="text-gray-600 dark:text-gray-300 mb-6">
Your account has been successfully verified.
</p>

<a
href="/"
className="bg-green-600 text-white px-6 py-3 rounded"
>

Go to Login

</a>

</div>

</div>

)

}

export default VerifySuccess;