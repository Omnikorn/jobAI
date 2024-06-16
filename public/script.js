$(document).ready(function() {

    let jobDetails;

    async function newAdvert(advert) {
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant analyzing job adverts. For each advert, return the following as a JSON object: Job title, company, city, job type, salary, skills, and notes.'
                        },
                        {
                            role: 'user',
                            content: advert
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API request failed:', errorText);
                return;
            }

            const gptResponse = await response.json();
            console.log('API response:', gptResponse);

            if (!gptResponse.choices || !gptResponse.choices[0] || !gptResponse.choices[0].message || !gptResponse.choices[0].message.content) {
                console.error('Unexpected API response structure:', gptResponse);
                return;
            }

            jobDetails = JSON.parse(gptResponse.choices[0].message.content);
displayJobDetails(jobDetails);


            sendJobDetails(jobDetails);
        } catch (error) {
            console.error('Error fetching or processing API response:', error);
        }
    }

    function displayJobDetails(details) {
        const chatAnswer = $('#chat_answer');
        chatAnswer.empty(); // Clear any existing content
    
        const detailsList = $('<ul></ul>'); // Create a new unordered list
    
        for (const key in details) {
            if (details.hasOwnProperty(key)) {
                const listItem = $('<li></li>').text(`${key}: ${details[key]}`);
                detailsList.append(listItem); // Append each list item to the list
            }
        }
    
        chatAnswer.append(detailsList); // Append the list to the chat_answer element
    }
    

    // function sendJobDetails(jobDetails) {
    //     console.log("Processed job details:", jobDetails);

    //     // Ensure jobDetails object has the expected properties
    //     if (!jobDetails || !jobDetails.company || !jobDetails.city || !jobDetails.jobType || !jobDetails.salary || !jobDetails.skills || !jobDetails.notes) {
    //         console.error("Job details object is not in the expected format");
    //         return;
    //     }

     
    // }

    $('#scrapeForm').on('submit', function(event) {
        event.preventDefault();
        const url = $('#weburl').val();
        $.ajax({
            type: 'POST',
            url: '/scrape',
            data: { url: url },
            success: function(response) {
                console.log("the response version is " + response);
                const ad = response.webtext;
                console.log("the scraped version is " + ad);
                 $('#site_text').text(response.webtext);
                newAdvert(ad);
            },
            error: function() {
                $('#site_text').text('Failed to scrape the website.');
            }
        });
    });
});
