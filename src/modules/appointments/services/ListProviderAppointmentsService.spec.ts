import AppError from '@shared/errors/AppError';

import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderAppointmentsService from './ListProviderAppointmentsService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let listProviderAppointments: ListProviderAppointmentsService;
let fakeCacheProvider: FakeCacheProvider;

describe('listProviderAppointments', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeCacheProvider = new FakeCacheProvider();

    listProviderAppointments = new ListProviderAppointmentsService(
      fakeAppointmentsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to list the appointments on a specific day', async () => {
    const appointment1 = await fakeAppointmentsRepository.create({
      provider_id: 'provider',
      user_id: 'user',
      date: new Date(2020, 5, 20, 14, 0, 0),
    });

    const appointment2 = await fakeAppointmentsRepository.create({
      provider_id: 'provider',
      user_id: 'user',
      date: new Date(2020, 5, 20, 15, 0, 0),
    });

    const appointments = await listProviderAppointments.execute({
      provider_id: 'provider',
      year: 2020,
      month: 6,
      day: 20,
    });

    expect(appointments).toEqual(
      expect.arrayContaining([appointment1, appointment2]),
    );
  });

  it('should be able to retrieve the appointments in the cache', async () => {
    await fakeAppointmentsRepository.create({
      provider_id: 'provider',
      user_id: 'user1',
      date: new Date(2020, 7, 20, 14, 0, 0),
    });

    await fakeAppointmentsRepository.create({
      provider_id: 'provider',
      user_id: 'user2',
      date: new Date(2020, 7, 20, 15, 0, 0),
    });

    await fakeAppointmentsRepository.create({
      provider_id: 'provider',
      user_id: 'user3',
      date: new Date(2020, 7, 20, 16, 0, 0),
    });

    const appointmens1 = await listProviderAppointments.execute({
      provider_id: 'provider',
      day: 20,
      month: 8,
      year: 2020,
    });

    const appointmens2 = await listProviderAppointments.execute({
      provider_id: 'provider',
      day: 20,
      month: 8,
      year: 2020,
    });

    expect(
      appointmens1.map(item => {
        const response = {
          date: item.date.toDateString(),
          id: item.id,
          provider_id: item.provider_id,
          user_id: item.user_id,
        };

        return response;
      }),
    ).toEqual(
      appointmens2.map(item => {
        const response = {
          date: new Date(item.date).toDateString(),
          id: item.id,
          provider_id: item.provider_id,
          user_id: item.user_id,
        };

        return response;
      }),
    );
  });
});
