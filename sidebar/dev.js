addEventListener('load', () => {

const	h2a = document.querySelector('hanamaru-2nd-album'),
		sampleComment =	{
									thread: 'M.7XH9Kuc_qhyPl0iT-T8D0Q',
									no: 1,
									vpos: 54100,
									date: 1622217825,
									date_usec: 480955,
									user_id: '115879928',
									premium: 3,
									content: 'test',
									yourpost: 1
								};


h2a.addComment(sampleComment)

}, { once: true });